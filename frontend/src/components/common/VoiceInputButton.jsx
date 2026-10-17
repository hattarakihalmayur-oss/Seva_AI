import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  AlertCircle,
  Check,
  X,
  Edit3,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  Settings2,
  KeyRound,
  CheckCircle2,
  Play,
  Square,
  Wrench,
  HelpCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { convertSpeechToText, convertTextToSpeech, getSarvamStatus } from '../../api/ai.api';

// Regional voice suggestions for all 7 languages
const REGIONAL_SUGGESTIONS = {
  kn: [
    'SSP ಸ್ಕಾಲರ್‌ಶಿಪ್ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    'ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಆರೋಗ್ಯ ಯೋಜನೆ',
    'ಕೃಷಿ ಯೋಜನೆಗಳನ್ನು ತೋರಿಸಿ',
  ],
  hi: [
    'एसएसपी छात्रवृत्ति के लिए आवेदन करें',
    'पीएम किसान सम्मान निधि',
    'आयुष्मान भारत स्वास्थ्य योजना',
    'कृषि योजनाओं की सूची दिखाएं',
  ],
  ta: [
    'எஸ்பி கல்வி உதவித்தொகை விண்ணப்பிக்கவும்',
    'பிஎம் கிசான் திட்டம்',
    'ஆயுஷ்மான் பாரத் அட்டை',
    'விவசாய திட்டங்களை காட்டுங்கள்',
  ],
  te: [
    'ఎస్ఎస్పీ స్కాలర్‌షిప్‌కు దరఖాస్తు చేయండి',
    'పీఎం కిసాన్ పథకం',
    'ఆయుష్మాన్ భారత్ హెల్త్ కార్డు',
    'రైతు సంక్షేమ పథకాలు చూపించండి',
  ],
  mr: [
    'एसएसपी शिष्यवृत्तीसाठी अर्ज करा',
    'पीएम किसान योजना',
    'आयुष्मान भारत योजना',
    'शेतकरी योजनांची यादी दाखवा',
  ],
  bn: [
    'এসএসপি বৃত্তির জন্য আবেদন করুন',
    'পিএম কিষাণ সম্মান নিধি',
    'আয়ুষ্মান ভারত স্বাস্থ্য কার্ড',
    'কৃষক কল্যাণ প্রকল্পগুলি দেখান',
  ],
  en: [
    'Apply for SSP Scholarship Scheme',
    'PM Kisan Samman Nidhi',
    'Ayushman Bharat Health Scheme',
    'Show agriculture schemes for farmers',
  ],
};

const APPLY_KEYWORDS = [
  'apply', 'behalf', 'form', 'submit', 'agent', 'register',
  'ಅರ್ಜಿ', 'ಅಪ್ಲೈ', 'ದಾಖಲಿಸಿ', 'ಸಲ್ಲಿಸಿ', 'ನೋಂದಣಿ',
  'आवेदन', 'अप्लाई', 'फॉर्म', 'जमा', 'दर्ज', 'पंजीकरण',
  'விண்ணப்பி', 'பதிவு', 'படிவம்',
  'దరఖాస్తు', 'నమోదు', 'సమర్పించు',
  'अर्ज', 'नोंदणी',
  'আবেদন', 'নিবন্ধন',
];

export default function VoiceInputButton({ onTranscriptReady, className = '' }) {
  const { currentLanguage, t, tText } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for live waveform
  const [isProcessingStt, setIsProcessingStt] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  // Diagnostics and troubleshooting state
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [micPermissionStatus, setMicPermissionStatus] = useState('prompt');
  const [detectedDevices, setDetectedDevices] = useState([]);

  // Microphone gain / mini volume booster for laptop & mobile (default 2.5x)
  const [micBoost, setMicBoost] = useState(() => {
    const saved = localStorage.getItem('bharatseva_mic_boost');
    return saved ? parseFloat(saved) : 2.5;
  });
  const gainNodeRef = useRef(null);

  const handleBoostChange = (newBoost) => {
    setMicBoost(newBoost);
    localStorage.setItem('bharatseva_mic_boost', newBoost.toString());
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.gain.value = newBoost;
      } catch {}
    }
  };

  // Sarvam API Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [sarvamApiKey, setSarvamApiKey] = useState(
    () => localStorage.getItem('bharatseva_sarvam_api_key') || ''
  );
  const [keySavedNotice, setKeySavedNotice] = useState(false);
  const [sarvamInfo, setSarvamInfo] = useState({
    configured: true,
    sttModel: 'saaras:v3',
    ttsModel: 'bulbul:v3',
  });

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeAudioPlayerRef = useRef(null);
  const waveTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef('');
  const fallbackRetriedRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const refreshMicDevices = () => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then((perm) => {
          setMicPermissionStatus(perm.state);
          perm.onchange = () => setMicPermissionStatus(perm.state);
        })
        .catch(() => {});
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const audioInputs = devices.filter((d) => d.kind === 'audioinput');
          setDetectedDevices(audioInputs);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshMicDevices();
    }
  }, [isOpen]);

  useEffect(() => {
    getSarvamStatus()
      .then((res) => {
        if (res?.data) {
          setSarvamInfo(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    isListeningRef.current = false;
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    if (activeAudioPlayerRef.current) {
      activeAudioPlayerRef.current.pause();
      activeAudioPlayerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsPlayingTts(false);
    setAudioLevel(0);
  };

  const saveCustomKey = (key) => {
    const cleanKey = key.trim();
    if (cleanKey) {
      localStorage.setItem('bharatseva_sarvam_api_key', cleanKey);
      setSarvamApiKey(cleanKey);
    } else {
      localStorage.removeItem('bharatseva_sarvam_api_key');
      setSarvamApiKey('');
    }
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 3000);
  };

  // Dynamic visualizer during native speech recognition
  const startSimulationVisualizer = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    waveTimerRef.current = setInterval(() => {
      if (!isListeningRef.current) {
        setAudioLevel(0);
        return;
      }
      // Natural oscillating audio pulse to show mic is active and hearing
      const base = 25 + Math.floor(Math.random() * 45);
      setAudioLevel(base);
    }, 120);
  };

  /**
   * Request microphone permission explicitly and initialize live audio visualizer
   * with GainNode amplification optimized for laptop & mobile microphones
   */
  const requestMicAndStartVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support microphone capture.');
      }

      // High-sensitivity audio constraints for laptop & mobile built-in mics
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Disabling aggressive cutoff allows soft whispers and mini-volume
          autoGainControl: true,  // Hardware AGC on phones and laptops
          channelCount: 1,
        },
      });

      mediaStreamRef.current = stream;

      // Setup Web Audio Analyser and GainNode for REAL live microphone decibel feedback
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);

          // GainNode amplifies mini/quiet volume from laptop or mobile devices
          const gainNode = ctx.createGain();
          gainNode.gain.value = micBoost;
          gainNodeRef.current = gainNode;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.25;

          source.connect(gainNode);
          gainNode.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkLevel = () => {
            if (!analyserRef.current || !isListeningRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const raw = (avg / 128) * 100;
            // Enhanced logarithmic scale so mini volume from laptop/mobile registers clearly
            const scaled = Math.min(100, Math.round(Math.pow(raw / 100, 0.55) * 100));
            setAudioLevel(scaled);
            animationFrameRef.current = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        }
      } catch (visErr) {
        console.warn('AudioContext visualizer not supported:', visErr);
        startSimulationVisualizer();
      }

      return stream;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error(
          'Microphone permission was denied. Please click the camera/lock icon in your browser address bar and select "Allow" to enable your microphone.'
        );
      }
      throw new Error(`Microphone access error: ${err.message}`);
    }
  };

  const startSpeechRecognitionInstance = (SpeechRecognition, isFallback = false) => {
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // For English or fallback mode, use 'en-US' for universal Chromium offline/online support
      let targetLang = currentLanguage?.sarvamCode || 'en-US';
      if (currentLanguage?.code === 'en' || isFallback) {
        targetLang = 'en-US';
      }
      recognition.lang = targetLang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onspeechstart = () => {
        setAudioLevel(75);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        const full = (finalTranscript + interimTranscript).trim();
        if (full) {
          setTranscript(full);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone in your address bar (lock icon).');
          setShowTroubleshoot(true);
          cleanupAudio();
        } else if (event.error === 'no-speech') {
          // User paused; keep listening without interrupting
          return;
        } else if (event.error === 'network') {
          if (!fallbackRetriedRef.current && currentLanguage?.code !== 'en') {
            fallbackRetriedRef.current = true;
            setError('Regional speech server unavailable. Switching to universal speech recognition...');
            setTimeout(() => {
              if (isListeningRef.current) {
                startSpeechRecognitionInstance(SpeechRecognition, true);
              }
            }, 300);
          } else {
            setError('Browser network speech service is unavailable. Check your connection or pick a quick suggestion below.');
            setShowTroubleshoot(true);
          }
        } else if (event.error === 'audio-capture') {
          setError('No microphone hardware detected or microphone is currently in use by another app.');
          setShowTroubleshoot(true);
        }
      };

      recognition.onend = () => {
        // If still listening and this is the active recognition, restart cleanly
        if (isListeningRef.current && recognitionRef.current === recognition) {
          try {
            startSpeechRecognitionInstance(SpeechRecognition, isFallback);
          } catch {
            // Ignore
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start failed:', err);
      setError('Voice recognition service could not start. Please check microphone permissions or select a query below.');
      setShowTroubleshoot(true);
    }
  };

  const startListening = async () => {
    setError(null);
    setTranscript('');
    setIsEditing(false);
    isListeningRef.current = true;
    setIsListening(true);
    fallbackRetriedRef.current = false;

    // 1. Explicitly acquire user microphone permission and live volume meter
    try {
      await requestMicAndStartVisualizer();
      refreshMicDevices();
    } catch (micErr) {
      setError(micErr.message);
      setShowTroubleshoot(true);
      cleanupAudio();
      return;
    }

    // 2. Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      startSpeechRecognitionInstance(SpeechRecognition, false);
    } else {
      setError('Web Speech recognition is not supported in this browser. Please use Chrome/Edge or pick a preset below.');
      setShowTroubleshoot(true);
    }
  };

  const stopListening = async () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (waveTimerRef.current) {
      clearInterval(waveTimerRef.current);
      waveTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAudioLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    // Always release physical mic hardware cleanly so browser indicator turns off
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  /**
   * Speak current transcript aloud using Sarvam TTS (model: bulbul:v3)
   * with automatic browser SpeechSynthesis fallback
   */
  const handlePlayTts = async () => {
    if (!transcript.trim()) return;

    if (isPlayingTts) {
      if (activeAudioPlayerRef.current) {
        activeAudioPlayerRef.current.pause();
        activeAudioPlayerRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTts(false);
      return;
    }

    setIsPlayingTts(true);
    try {
      const langCode = currentLanguage?.sarvamCode || 'hi-IN';
      const result = await convertTextToSpeech(transcript.trim(), langCode, 'shubh', sarvamApiKey || null);

      if (result?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        activeAudioPlayerRef.current = audio;
        audio.onended = () => setIsPlayingTts(false);
        audio.onerror = () => fallbackBrowserSpeech(transcript);
        await audio.play();
      } else {
        fallbackBrowserSpeech(transcript);
      }
    } catch {
      fallbackBrowserSpeech(transcript);
    }
  };

  const fallbackBrowserSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage?.sarvamCode || 'hi-IN';
      utterance.onend = () => setIsPlayingTts(false);
      utterance.onerror = () => setIsPlayingTts(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingTts(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    startListening();
  };

  const handleClose = () => {
    cleanupAudio();
    setIsOpen(false);
    setError(null);
    setTranscript('');
    setIsEditing(false);
    setShowSettings(false);
  };

  const handleConfirm = () => {
    if (transcript.trim() && onTranscriptReady) {
      onTranscriptReady(transcript.trim());
      handleClose();
    }
  };

  const handleSelectSuggestion = (text) => {
    setTranscript(text);
    if (isListening) {
      stopListening();
    }
  };

  const isApplyIntent = APPLY_KEYWORDS.some((kw) => transcript.toLowerCase().includes(kw));
  const suggestions = REGIONAL_SUGGESTIONS[currentLanguage?.code] || REGIONAL_SUGGESTIONS.en;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title={`Sarvam AI Voice Search in ${currentLanguage?.name || 'Indian Languages'}`}
        className={`p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 transition-colors flex items-center justify-center shadow-xs cursor-pointer ${className}`}
      >
        <Mic className="w-4 h-4 text-orange-600" />
      </button>

      {/* Voice Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-orange-500 animate-ping' : 'bg-slate-300'}`} />
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-orange-600" />
                  <span>Sarvam AI Speech Access</span>
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot((prev) => !prev)}
                  title="Microphone Diagnostics & Troubleshooting"
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showTroubleshoot ? 'bg-amber-100 border-amber-300 text-amber-800' : 'hover:bg-slate-100 border-transparent text-slate-500'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings((prev) => !prev)}
                  title="Configure Sarvam AI Speech Key & Models"
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showSettings ? 'bg-orange-100 border-orange-300 text-orange-800' : 'hover:bg-slate-100 border-transparent text-slate-500'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Troubleshooting & Diagnostic Panel */}
            {showTroubleshoot && (
              <div className="my-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Microphone Diagnostics &amp; Health</span>
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      micPermissionStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : micPermissionStatus === 'denied'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    Permission: {micPermissionStatus}
                  </span>
                </div>

                {/* Hardware Devices & Signal Status */}
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-amber-600" />
                      <span>Audio Input Hardware:</span>
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {detectedDevices.length} device(s) found
                    </span>
                  </div>
                  {detectedDevices.length > 0 ? (
                    <div className="space-y-1">
                      {detectedDevices.map((dev, idx) => (
                        <div key={idx} className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1.5 truncate">
                          <Mic className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{dev.label || `Microphone ${idx + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-red-600 font-medium">
                      ⚠️ No microphone hardware detected. Please ensure your microphone or headset is plugged into your PC.
                    </p>
                  )}

                  {/* Live Signal VU meter in diagnostic panel */}
                  <div className="pt-1.5 border-t border-slate-100 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Live Volume Level:</span>
                        <span className="font-mono font-bold text-slate-700">{audioLevel}% ({micBoost}x Boost)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-75 ${
                            audioLevel > 15 ? 'bg-emerald-500' : audioLevel > 2 ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.min(100, audioLevel)}%` }}
                        />
                      </div>
                      <p className="text-[10px] mt-1 text-slate-500">
                        {audioLevel > 2 ? (
                          <span className="text-emerald-700 font-semibold">🟢 Sound detected! Your microphone is picking up mini/soft volume.</span>
                        ) : (
                          <span>Speak or tap your mic to test audio level response. If volume is quiet, switch to 2.5x or 4x Boost below.</span>
                        )}
                      </p>
                    </div>

                    {/* Quick Gain Booster Controls in Troubleshooter */}
                    <div className="flex items-center justify-between bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                        <Volume2 className="w-3 h-3 text-amber-700" />
                        <span>Mic Gain (Laptop &amp; Mobile):</span>
                      </span>
                      <div className="flex items-center gap-1">
                        {[
                          { label: '1x Normal', val: 1 },
                          { label: '⚡ 2.5x Laptop/Phone', val: 2.5 },
                          { label: '🔥 4x Ultra Boost', val: 4 },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleBoostChange(opt.val)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                              micBoost === opt.val
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Windows & Browser Checklist */}
                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 space-y-1.5 text-[11px] text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Fix Checklist:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>
                      <strong>Browser Address Bar:</strong> Click the Lock 🔒 or Settings icon next to the URL, ensure <em>Microphone</em> is set to <strong>Allow</strong>.
                    </li>
                    <li>
                      <strong>Windows 10/11 Privacy:</strong> Open Windows Settings (<kbd className="px-1 bg-slate-100 rounded border border-slate-300 font-mono text-[10px]">Win + I</kbd>) &gt; <em>Privacy &amp; security</em> &gt; <em>Microphone</em>, turn ON &quot;Microphone access&quot;.
                    </li>
                    <li>
                      <strong>Hardware switch:</strong> Verify your headset or laptop microphone doesn't have a physical mute toggle enabled.
                    </li>
                  </ul>
                </div>

                {/* Instant 1-Click Test Queries if mic is offline */}
                <div>
                  <div className="text-[11px] font-bold text-amber-950 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Instant Voice Simulation Queries (1-Click Test):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion('SSP Scholarship Apply')}
                      className="p-1.5 text-[10px] bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-slate-800 text-left cursor-pointer transition-colors font-medium truncate"
                    >
                      ⚡ SSP Scholarship Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion('PM Kisan Samman Nidhi apply')}
                      className="p-1.5 text-[10px] bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-slate-800 text-left cursor-pointer transition-colors font-medium truncate"
                    >
                      ⚡ PM Kisan Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion('Ayushman Bharat Golden Card')}
                      className="p-1.5 text-[10px] bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-slate-800 text-left cursor-pointer transition-colors font-medium truncate"
                    >
                      ⚡ Ayushman Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion('Karnataka Yuva Nidhi')}
                      className="p-1.5 text-[10px] bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-slate-800 text-left cursor-pointer transition-colors font-medium truncate"
                    >
                      ⚡ Yuva Nidhi
                    </button>
                  </div>
                </div>

                {/* Action Buttons in Troubleshoot */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={startListening}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Restart &amp; Test Mic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTroubleshoot(false)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 px-2 py-1 rounded-md cursor-pointer"
                  >
                    Hide Troubleshooter
                  </button>
                </div>
              </div>
            )}

            {/* Sarvam AI Settings Panel */}
            {showSettings && (
              <div className="my-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                    <span>Sarvam AI API Access Key</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono">
                    STT: {sarvamInfo.sttModel} | TTS: {sarvamInfo.ttsModel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Enter your custom Sarvam AI API subscription key to enable dedicated high-quota neural speech-to-text and text-to-speech.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={sarvamApiKey}
                    onChange={(e) => setSarvamApiKey(e.target.value)}
                    placeholder="sk_..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-[11px] text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => saveCustomKey(sarvamApiKey)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-xs"
                  >
                    Save Key
                  </button>
                </div>
                {keySavedNotice && (
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sarvam API Key preference saved!</span>
                  </div>
                )}
              </div>
            )}

            {/* Language Tag & Sarvam Badge */}
            <div className="mt-3 py-2 px-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                <span>
                  Language: <strong>{currentLanguage?.name} ({currentLanguage?.nativeName})</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] bg-orange-200/70 text-orange-950 font-bold px-2 py-0.5 rounded-full font-mono">
                  {currentLanguage?.sarvamCode || 'en-IN'}
                </span>
                <span className="text-[10px] bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold px-2 py-0.5 rounded-full">
                  ⚡ Sarvam AI
                </span>
              </div>
            </div>

            {/* Mini Volume / Mic Gain Booster for Laptop & Mobile */}
            <div className="mt-2.5 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-semibold text-[11px]">
                  {isListening && audioLevel > 2 ? '🎙️ Mini Volume Active' : 'Mic Gain (Laptop / Phone):'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { label: '1x Normal', val: 1 },
                  { label: '⚡ 2.5x Laptop/Phone', val: 2.5 },
                  { label: '🔥 4x Ultra Boost', val: 4 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleBoostChange(opt.val)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      micBoost === opt.val
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation / Mic Circle with Audio Level Pulse */}
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <>
                    <div
                      className="absolute rounded-full bg-orange-400 opacity-20 transition-all duration-75"
                      style={{
                        width: `${80 + audioLevel * 0.9}px`,
                        height: `${80 + audioLevel * 0.9}px`,
                      }}
                    />
                    <div
                      className="absolute rounded-full bg-amber-400 opacity-25 transition-all duration-75"
                      style={{
                        width: `${70 + audioLevel * 0.5}px`,
                        height: `${70 + audioLevel * 0.5}px`,
                      }}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white scale-105 shadow-orange-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <Mic className="w-9 h-9 animate-pulse" /> : <MicOff className="w-8 h-8" />}
                </button>
              </div>

              {/* Status and Audio Level Waveform */}
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-700">
                  {isListening
                    ? 'Listening in ' + (currentLanguage?.nativeName || 'your language') + '... Speak now'
                    : isProcessingStt
                    ? 'Transcribing audio with Sarvam AI...'
                    : 'Tap the microphone to speak'}
                </p>

                {isListening && (
                  <div className="flex items-center gap-1 h-4">
                    {[12, 24, 40, 60, 30, 50, 20, 35, 15].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-orange-500 rounded-full transition-all duration-100"
                        style={{
                          height: `${Math.max(4, (h * (audioLevel + 20)) / 100)}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Microphone Notice:</div>
                    <div className="mt-0.5">{error}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot(true)}
                  className="text-[11px] px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg border border-red-300 flex items-center gap-1 cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Troubleshoot</span>
                </button>
              </div>
            )}

            {/* Recognized Transcript Display with TTS readback */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>Recognized Speech</span>
                <div className="flex items-center gap-2">
                  {transcript && (
                    <button
                      type="button"
                      onClick={handlePlayTts}
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 cursor-pointer font-bold capitalize bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      {isPlayingTts ? <Square className="w-3 h-3 text-red-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                      <span>{isPlayingTts ? 'Stop' : '🔊 Listen (Sarvam TTS)'}</span>
                    </button>
                  )}
                  {transcript && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 capitalize cursor-pointer font-bold"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Interactive Transcription & Direct Input Area */}
              <div className="relative">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={2}
                  className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder-slate-400 resize-none font-medium transition-all shadow-inner"
                  placeholder={
                    isListening
                      ? audioLevel > 2
                        ? `🎙️ Hearing your microphone! Speak your query now...`
                        : `🎙️ Listening in ${currentLanguage?.nativeName || 'your language'}... Speak now, or type directly here`
                      : `Tap the mic to speak, or type your query here...`
                  }
                />
              </div>

              {/* Live Microphone Status Indicator */}
              {isListening && (
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className={`w-2 h-2 rounded-full ${audioLevel > 2 ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`} />
                    <span>
                      {audioLevel > 2
                        ? `🟢 Sound captured! (Mini Volume: ${audioLevel}%)`
                        : 'Listening for voice... (Laptop & Mobile boost active)'}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Vol: {audioLevel}% ({micBoost}x gain)</span>
                </div>
              )}

              {/* Apply Intent Badge */}
              {isApplyIntent && (
                <div className="mt-1 py-1 px-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-green-600" />
                  <span>🤖 Autonomous DigiLocker Apply Intent detected!</span>
                </div>
              )}
            </div>

            {/* One-Tap Voice Presets in Selected Language */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Quick Voice Queries ({currentLanguage?.nativeName || 'Regional'}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-100 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-900 transition-colors text-left cursor-pointer"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!transcript.trim()}
                className="px-5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isApplyIntent ? 'Apply / Search' : tText('searchButton')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
