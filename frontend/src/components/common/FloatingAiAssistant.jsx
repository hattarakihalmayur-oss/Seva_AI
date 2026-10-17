import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Maximize2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { queryAiAssistant, convertTextToSpeech } from '../../api/ai.api';
import VoiceInputButton from './VoiceInputButton';
import EligibilityBadge from './EligibilityBadge';
import AgentApplicationModal from '../agent/AgentApplicationModal';

export default function FloatingAiAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage, t, tPure } = useLanguage();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init_welcome',
      sender: 'bot',
      text: 'Namaste! I am your BharatSeva AI Assistant. Ask me anything or let me autonomously apply for schemes on your behalf.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      schemes: [],
    },
  ]);
  const [selectedSchemeForAgent, setSelectedSchemeForAgent] = useState(null);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isInChatListening, setIsInChatListening] = useState(false);
  const activeAudioRef = useRef(null);
  const inChatRecognitionRef = useRef(null);
  const chatScrollRef = useRef(null);

  const handleSpeak = async (msgId, text) => {
    if (playingMessageId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msgId);
    try {
      const lang = currentLanguage?.sarvamCode || 'hi-IN';
      const result = await convertTextToSpeech(text.slice(0, 500), lang);
      if (result?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        activeAudioRef.current = audio;
        audio.onended = () => setPlayingMessageId(null);
        audio.onerror = () => fallbackSpeak(text, lang, msgId);
        await audio.play();
      } else {
        fallbackSpeak(text, lang, msgId);
      }
    } catch {
      fallbackSpeak(text, currentLanguage?.sarvamCode || 'hi-IN', msgId);
    }
  };

  const fallbackSpeak = (text, lang, msgId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.onend = () => setPlayingMessageId(null);
      u.onerror = () => setPlayingMessageId(null);
      window.speechSynthesis.speak(u);
    } else {
      setPlayingMessageId(null);
    }
  };

  const toggleInChatSpeech = () => {
    if (isInChatListening) {
      if (inChatRecognitionRef.current) {
        try {
          inChatRecognitionRef.current.stop();
        } catch {}
      }
      setIsInChatListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let targetLang = currentLanguage?.sarvamCode || 'en-US';
      if (currentLanguage?.code === 'en') {
        targetLang = 'en-US';
      }
      recognition.lang = targetLang;

      recognition.onstart = () => setIsInChatListening(true);
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }
        const full = (final + interim).trim();
        if (full) {
          setInputText(full);
        }
      };
      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          return;
        }
        setIsInChatListening(false);
      };
      recognition.onend = () => {
        if (inChatRecognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch {
            setIsInChatListening(false);
          }
        } else {
          setIsInChatListening(false);
        }
      };

      inChatRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsInChatListening(false);
    }
  };

  // If on the full /chat page, hide the floating drawer to prevent visual redundancy
  const isOnChatPage = location.pathname === '/chat';

  // Direct continue if returned from login
  useEffect(() => {
    if (user && (location.state?.autoApply || sessionStorage.getItem('bharatseva_pending_apply_scheme'))) {
      const pending = location.state?.scheme || (() => {
        try {
          const s = sessionStorage.getItem('bharatseva_pending_apply_scheme');
          return s ? JSON.parse(s) : null;
        } catch {
          return null;
        }
      })();
      if (pending) {
        setSelectedSchemeForAgent(pending);
        setAgentModalOpen(true);
      }
      sessionStorage.removeItem('bharatseva_pending_apply_scheme');
    }
  }, [user, location.state]);

  useEffect(() => {
    if (isOpen) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    if (inChatRecognitionRef.current) {
      try {
        inChatRecognitionRef.current.stop();
      } catch {}
      setIsInChatListening(false);
    }

    const query = (queryText || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await queryAiAssistant(
        query,
        currentLanguage?.code || 'en',
        user || {}
      );
      const aiData = response.data;

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: aiData.explanation || 'Here is the verified welfare information from official government databases.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schemes: aiData.recommendedSchemes || [],
        actionIntent: aiData.actionIntent,
      };

      setMessages((prev) => [...prev, botMsg]);
      setTimeout(() => handleSpeak(botMsg.id, botMsg.text), 150);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: 'I could not connect to the remote service, but you can explore all verified schemes directly in the directory.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          schemes: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchAgent = (scheme) => {
    if (!user) {
      sessionStorage.setItem('bharatseva_pending_apply_scheme', JSON.stringify(scheme));
      setIsOpen(false);
      navigate('/login', {
        state: {
          from: location,
          applyScheme: scheme,
        },
      });
      return;
    }
    setSelectedSchemeForAgent(scheme);
    setAgentModalOpen(true);
  };

  if (isOnChatPage) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-200 shadow-md text-xs font-semibold text-slate-700 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI Assistant Ready</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-4 focus:ring-orange-300"
          title="Open BharatSeva AI Assistant"
          aria-label="Open AI Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>

          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <Bot className="w-7 h-7 transition-transform group-hover:scale-110 duration-200" />
          )}
        </button>
      </div>

      {/* Floating Drawer / Modal Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 w-[92vw] sm:w-[420px] max-h-[580px] h-[78vh] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-3.5 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>BharatSeva AI</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-normal">
                    {currentLanguage?.name || 'English'}
                  </span>
                </h3>
                <p className="text-[11px] text-orange-100 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-200" />
                  <span>Autonomous DigiLocker Agent</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white">
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Expand to Full Chat Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Bar */}
          <div className="bg-orange-50/70 border-b border-orange-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-orange-800 font-bold whitespace-nowrap">
              {currentLanguage?.code === 'kn' ? 'ಪ್ರಯತ್ನಿಸಿ:' : currentLanguage?.code === 'hi' ? 'सुझाव:' : 'Try:'}
            </span>
            {(
              {
                kn: ['SSP ಸ್ಕಾಲರ್‌ಶಿಪ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ', 'ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ', 'ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸೋಲಾರ್', 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್'],
                hi: ['एसएसपी स्कॉलरशिप के लिए आवेदन करें', 'पीएम किसान सम्मान निधि', 'पीएम सूर्य घर सोलर', 'आयुष्मान भारत योजना'],
                ta: ['எஸ்பி உதவித்தொகைக்கு விண்ணப்பிக்கவும்', 'பிஎம் கிசான் திட்டம்', 'பிஎம் சூர்யா கர்', 'ஆயுஷ்மான் பாரத்'],
                te: ['ఎస్ఎస్పీ స్కాలర్‌షిప్‌కు దరఖాస్తు చేయండి', 'పీఎం కిసాన్ పథకం', 'పీఎం సూర్య ఘర్', 'ఆయుష్మాన్ భారత్'],
                mr: ['एसएसपी शिष्यवृत्तीसाठी अर्ज करा', 'पीएम किसान योजना', 'पीएम सूर्य घर', 'आयुष्मान भारत'],
                bn: ['এসএসপি বৃত্তির জন্য আবেদন করুন', 'পিএম কিষাণ সম্মান নিধি', 'পিএম সূর্য ঘর', 'আয়ুষ্মান ভারত'],
                en: ['Apply for SSP Scholarship', 'PM Kisan Yojana', 'PM Surya Ghar Solar', 'Ayushman Bharat Health'],
              }[currentLanguage?.code] || ['Apply for SSP Scholarship', 'PM Kisan Yojana', 'PM Surya Ghar Solar', 'Ayushman Bharat Health']
            ).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2 py-0.5 rounded-full bg-white hover:bg-orange-100 border border-orange-200 text-orange-900 whitespace-nowrap transition-colors cursor-pointer shadow-2xs font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 shadow-2xs text-xs ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* Sarvam AI TTS Listen Button */}
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200 cursor-pointer shadow-2xs"
                      title="Listen with Sarvam AI Speech"
                    >
                      {playingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-red-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-orange-600" />
                          <span>🔊 Listen ({currentLanguage?.name || 'Regional'})</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Action Intent Banner */}
                  {msg.actionIntent && msg.actionIntent.scheme && (
                    <div className="mt-2.5 p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-950">
                      <p className="font-bold text-[11px] text-orange-900 flex items-center gap-1">
                        <span>
                          {currentLanguage?.code === 'kn'
                            ? '🤖 AI ಸ್ವಾಯತ್ತ ಅರ್ಜಿ ಸಿದ್ಧವಾಗಿದೆ'
                            : currentLanguage?.code === 'hi'
                            ? '🤖 AI स्वायत्त आवेदन तैयार है'
                            : currentLanguage?.code === 'ta'
                            ? '🤖 AI தன்னாட்சி விண்ணப்பம் தயார்'
                            : currentLanguage?.code === 'te'
                            ? '🤖 AI స్వయంప్రతిపత్తి దరఖాస్తు సిద్ధంగా ఉంది'
                            : currentLanguage?.code === 'mr'
                            ? '🤖 AI स्वायत्त अर्ज तयार आहे'
                            : currentLanguage?.code === 'bn'
                            ? '🤖 AI স্বায়ত্তশাসিত আবেদন প্রস্তুত'
                            : '🤖 Autonomous Apply Ready'}
                        </span>
                      </p>
                      <button
                        onClick={() => handleLaunchAgent(msg.actionIntent.scheme)}
                        className="mt-1.5 w-full py-1.5 px-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>
                          {currentLanguage?.code === 'kn'
                            ? '🤖 AI ಏಜೆಂಟ್‌ನೊಂದಿಗೆ ಈಗಲೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'
                            : currentLanguage?.code === 'hi'
                            ? '🤖 AI एजेंट के साथ अभी आवेदन करें'
                            : currentLanguage?.code === 'ta'
                            ? '🤖 AI முகவர் மூலம் விண்ணப்பிக்கவும்'
                            : currentLanguage?.code === 'te'
                            ? '🤖 AI ఏజెంట్‌తో ఇప్పుడే దరఖాస్తు చేయండి'
                            : currentLanguage?.code === 'mr'
                            ? '🤖 AI एजंटसह आता अर्ज करा'
                            : currentLanguage?.code === 'bn'
                            ? '🤖 AI এজেন্টের সাথে এখনই আবেদন করুন'
                            : '🤖 Apply with AI Agent Now'}
                        </span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Recommended Scheme Mini Cards */}
                  {msg.schemes && msg.schemes.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-2">
                      {msg.schemes.slice(0, 2).map((scheme, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-orange-200 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-[11px] text-slate-900 truncate">
                              {scheme.name}
                            </span>
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-blue-100 text-blue-800 flex-shrink-0">
                              {scheme.type || 'State'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mb-1.5">
                            {scheme.description}
                          </p>
                          <div className="flex items-center justify-between gap-1">
                            <Link
                              to={`/schemes/${scheme.slug || scheme.id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-[10px] font-semibold text-orange-600 hover:underline"
                            >
                              Details &rarr;
                            </Link>
                            <button
                              onClick={() => handleLaunchAgent(scheme)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-700 text-white cursor-pointer shadow-2xs"
                            >
                              🤖 Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      msg.sender === 'user' ? 'text-orange-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-500 text-xs">
                <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px] animate-pulse">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-600 ml-1">Evaluating scheme records...</span>
                </div>
              </div>
            )}

            <div ref={chatScrollRef} />
          </div>

          {/* Input Footer with Direct In-Chat Speech Mic */}
          <div className="p-2 bg-white border-t border-slate-200">
            {isInChatListening && (
              <div className="mb-1.5 px-2 py-0.5 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-600 font-bold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>Listening in {currentLanguage?.name || 'Regional'}... Speak now</span>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white transition-all"
            >
              <button
                type="button"
                onClick={toggleInChatSpeech}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  isInChatListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
                title={isInChatListening ? 'Stop Listening' : `Speak in ${currentLanguage?.name || 'Regional'}`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>

              <VoiceInputButton
                onTranscriptReady={(txt) => {
                  setInputText(txt);
                  handleSend(txt);
                }}
                className="border-0 bg-white hover:bg-orange-50 p-1"
              />

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isInChatListening
                    ? `Listening in ${currentLanguage?.nativeName || 'your language'}...`
                    : 'Ask schemes, SSP scholarship, or apply...'
                }
                disabled={loading}
                className="flex-1 px-1.5 py-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Autonomous Agent Application Modal */}
      <AgentApplicationModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        scheme={selectedSchemeForAgent}
      />
    </>
  );
}
