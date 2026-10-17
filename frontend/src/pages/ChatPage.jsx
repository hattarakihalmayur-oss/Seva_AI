import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Bookmark,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { queryAiAssistant, convertTextToSpeech } from '../api/ai.api';
import EligibilityBadge from '../components/common/EligibilityBadge';
import VoiceInputButton from '../components/common/VoiceInputButton';
import AgentApplicationModal from '../components/agent/AgentApplicationModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function ChatPage() {
  const { currentLanguage, currentLangCode, t, tText, tPure } = useLanguage();
  const { user, isSchemeSaved, toggleSaveScheme } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSchemeForAgent, setSelectedSchemeForAgent] = useState(null);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isInChatListening, setIsInChatListening] = useState(false);
  const [autoVoiceReplies, setAutoVoiceReplies] = useState(true);

  const activeAudioRef = useRef(null);
  const inChatRecognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Strip markdown formatting for natural speech synthesis
  const cleanSpeechText = (text) => {
    if (!text) return '';
    return text
      .replace(/[*#_`~>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/🤖|✨|•|👉/g, '')
      .trim();
  };

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
    const clean = cleanSpeechText(text);

    try {
      const lang = currentLanguage?.sarvamCode || 'hi-IN';
      const result = await convertTextToSpeech(clean.slice(0, 500), lang);
      if (result?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
        activeAudioRef.current = audio;
        audio.onended = () => setPlayingMessageId(null);
        audio.onerror = () => fallbackSpeak(clean, lang);
        await audio.play();
      } else {
        fallbackSpeak(clean, lang);
      }
    } catch {
      fallbackSpeak(clean, currentLanguage?.sarvamCode || 'hi-IN');
    }
  };

  const fallbackSpeak = (text, lang) => {
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

  // Direct In-Chat Speech Recognition
  const toggleInChatSpeech = () => {
    if (isInChatListening) {
      if (inChatRecognitionRef.current) {
        try {
          inChatRecognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsInChatListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech recognition is not supported in this browser. Please use Chrome/Edge or type your query.');
      return;
    }

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

      recognition.onstart = () => {
        setIsInChatListening(true);
        setError(null);
      };

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
        console.warn('In-chat SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone in your address bar.');
          setIsInChatListening(false);
        } else if (event.error === 'no-speech') {
          // Keep listening while user thinks
          return;
        } else if (event.error === 'network') {
          setError('Browser speech network service is unavailable. You can use the Voice Assistant modal or type directly.');
          setIsInChatListening(false);
        }
      };

      recognition.onend = () => {
        // If still listening, resume recognition
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
    } catch (err) {
      console.warn('Failed to start in-chat speech recognition:', err);
      setIsInChatListening(false);
    }
  };

  // Process incoming query parameter ?q=... or navigation state from Voice Apply
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const incomingQuery = location.state?.query || params.get('q');
    if (incomingQuery && incomingQuery.trim()) {
      handleSend(incomingQuery.trim());
    }
  }, [location.search, location.state]);

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

  // Initialize or update initial greeting when language changes if no conversation happened yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'init_1',
            sender: 'bot',
            text: tPure('chatGreeting') || `Namaste! I am your BharatSeva AI Assistant. What welfare assistance or subsidy are you looking for today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            schemes: [],
          },
        ];
      }
      return prev;
    });
  }, [currentLangCode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    // If in-chat speech is currently listening, stop it
    if (inChatRecognitionRef.current) {
      try {
        inChatRecognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsInChatListening(false);
    }

    const query = (textToSend || inputText).trim();
    if (!query) return;

    setError(null);
    const userMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await queryAiAssistant(
        query,
        currentLanguage.code,
        user || {}
      );

      const aiData = response.data;

      const botMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: aiData.explanation || 'Here are the matching welfare programs and guidelines from verified official records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schemes: aiData.recommendedSchemes || [],
        actionIntent: aiData.actionIntent,
        disclaimer: aiData.disclaimer,
      };

      setMessages((prev) => [...prev, botMessage]);

      // If Auto-Voice Output is enabled, automatically speak AI reply aloud
      if (autoVoiceReplies) {
        setTimeout(() => {
          handleSpeak(botMessage.id, botMessage.text);
        }, 150);
      }
    } catch (err) {
      setError(err.message || 'Could not connect to the AI assistant service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchAgent = (scheme) => {
    if (!user) {
      sessionStorage.setItem('bharatseva_pending_apply_scheme', JSON.stringify(scheme));
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

  const handleVoiceTranscript = (transcript) => {
    setInputText(transcript);
    handleSend(transcript);
  };

  const samplePrompts = [
    tPure('prompt1'),
    tPure('prompt2'),
    tPure('prompt3'),
    tPure('prompt4'),
  ].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{t('aiAssistantTitle')}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                {currentLanguage.nativeName} ({currentLanguage.name})
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {t('trustLanguagesSub')} &middot; {t('verifiedWithOfficial')}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `init_${Date.now()}`,
                sender: 'bot',
                text: tPure('chatGreeting'),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                schemes: [],
              },
            ])
          }
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('resetFilters')}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs shadow-2xs">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs text-xs sm:text-sm ${
                msg.sender === 'user'
                  ? 'bg-orange-600 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Sarvam AI TTS Audio Playback Button */}
              {msg.sender === 'bot' && (
                <button
                  type="button"
                  onClick={() => handleSpeak(msg.id, msg.text)}
                  className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer shadow-2xs transition-colors"
                  title="Listen with Sarvam AI Speech"
                >
                  {playingMessageId === msg.id ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-600" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                      <span>🔊 Listen in {currentLanguage?.nativeName || 'Regional'} (Sarvam TTS)</span>
                    </>
                  )}
                </button>
              )}

              {/* Action Intent Banner for Autonomous Application */}
              {msg.actionIntent && msg.actionIntent.scheme && (
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-2xs">
                      🤖
                    </div>
                    <div>
                      <p className="font-bold text-xs text-orange-900">
                        {currentLanguage?.code === 'kn'
                          ? '🤖 AI ಸ್ವಾಯತ್ತ ಡಿಜಿಲಾಕರ್ ಅರ್ಜಿ ಸಿದ್ಧವಾಗಿದೆ'
                          : currentLanguage?.code === 'hi'
                          ? '🤖 AI स्वायत्त डिजिलॉकर आवेदन तैयार है'
                          : currentLanguage?.code === 'ta'
                          ? '🤖 AI தன்னாட்சி டிஜிலாக்கர் விண்ணப்பம் தயார்'
                          : currentLanguage?.code === 'te'
                          ? '🤖 AI స్వయంప్రతిపత్తి డిజిలాకర్ దరఖాస్తు సిద్ధంగా ఉంది'
                          : currentLanguage?.code === 'mr'
                          ? '🤖 AI स्वायत्त डिजिलॉकर अर्ज तयार आहे'
                          : currentLanguage?.code === 'bn'
                          ? '🤖 AI স্বায়ত্তশাসিত ডিজিলকার আবেদন প্রস্তুত'
                          : '🤖 Autonomous DigiLocker Application Ready'}
                      </p>
                      <p className="text-[11px] text-orange-800 leading-snug">
                        {msg.actionIntent.message || `I can apply for ${msg.actionIntent.scheme.name} on your behalf using your verified DigiLocker vault.`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLaunchAgent(msg.actionIntent.scheme)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all whitespace-nowrap self-end sm:self-auto cursor-pointer"
                  >
                    <span>
                      {currentLanguage?.code === 'kn'
                        ? '🤖 AI ಏಜೆಂಟ್‌ನೊಂದಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ'
                        : currentLanguage?.code === 'hi'
                        ? '🤖 AI एजेंट के साथ आवेदन करें'
                        : currentLanguage?.code === 'ta'
                        ? '🤖 AI முகவர் மூலம் விண்ணப்பிக்கவும்'
                        : currentLanguage?.code === 'te'
                        ? '🤖 AI ఏజెంట్‌తో దరఖాస్తు చేయండి'
                        : currentLanguage?.code === 'mr'
                        ? '🤖 AI एजंटसह अर्ज करा'
                        : currentLanguage?.code === 'bn'
                        ? '🤖 AI এজেন্টের সাথে আবেদন করুন'
                        : '🤖 Apply with AI Agent'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Render Recommended Scheme Cards inside Bot Reply */}
              {msg.schemes && msg.schemes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{t('recommendedSchemesTitle')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.schemes.map((scheme, idx) => {
                      const schemeId = scheme.slug || scheme.id;
                      const isSaved = isSchemeSaved(schemeId);

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50/40 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                {scheme.type || 'Central'}
                              </span>
                              <EligibilityBadge category={scheme.assessmentCategory} size="sm" />
                            </div>

                            <Link
                              to={`/schemes/${schemeId}`}
                              className="font-bold text-xs text-slate-900 hover:text-orange-600 line-clamp-1 block"
                            >
                              {scheme.name}
                            </Link>

                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {scheme.description}
                            </p>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/schemes/${schemeId}`}
                                className="text-[11px] font-semibold text-orange-600 hover:underline flex items-center gap-1"
                              >
                                <span>{t('viewDetails')}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>

                              <button
                                onClick={() => handleLaunchAgent(scheme)}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Autonomous DigiLocker Application"
                              >
                                <span>🤖 Apply with Agent</span>
                              </button>
                            </div>

                            <button
                              onClick={() => toggleSaveScheme(schemeId)}
                              className="p-1 text-slate-400 hover:text-orange-600"
                              title={isSaved ? tText('savedScheme') : tText('saveScheme')}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {msg.disclaimer && (
                <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                  {msg.disclaimer}
                </div>
              )}

              <span
                className={`block text-[10px] mt-2 text-right ${
                  msg.sender === 'user' ? 'text-orange-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs shadow-2xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 items-center text-slate-500 text-xs">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 font-bold text-xs animate-pulse">
              AI
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-600 text-xs font-medium ml-1">
                {t('heroBadge')}...
              </span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1]?.text)}
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-600">
          <span className="text-slate-400 font-semibold whitespace-nowrap">
            {t('suggestedQueries')}:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-700 whitespace-nowrap transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Speech Chat Dual Mode Control Bar */}
      <div className="mt-3 flex items-center justify-between text-xs px-3 py-1.5 bg-orange-50/90 border border-orange-200 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex items-center gap-1 font-bold text-orange-950 text-xs">
            <span>🎙️ Dual Speech & Text Chat:</span>
            <span className="text-[10px] bg-orange-200/80 text-orange-950 px-2 py-0.5 rounded-full font-bold">
              {currentLanguage?.name} ({currentLanguage?.nativeName})
            </span>
          </span>
          {isInChatListening && (
            <span className="text-xs text-red-600 font-bold flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Listening to your voice... Speak now!</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (autoVoiceReplies) {
              if (activeAudioRef.current) activeAudioRef.current.pause();
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setPlayingMessageId(null);
            }
            setAutoVoiceReplies(!autoVoiceReplies);
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            autoVoiceReplies
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300'
          }`}
          title="Toggle automatic voice speech readout of AI answers"
        >
          {autoVoiceReplies ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span>{autoVoiceReplies ? '🔊 Voice Mode: ON' : '🔇 Voice Mode: OFF'}</span>
        </button>
      </div>

      {/* Input Form Bar */}
      <div className="mt-1.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-md focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all"
        >
          {/* Direct In-Chat Live Mic Button */}
          <button
            type="button"
            onClick={toggleInChatSpeech}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0 ${
              isInChatListening
                ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400'
                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
            }`}
            title={isInChatListening ? 'Stop Listening' : `Speak in ${currentLanguage?.name || 'Regional Language'}`}
          >
            {isInChatListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Modal Voice Search Dialog fallback */}
          <VoiceInputButton
            onTranscriptReady={handleVoiceTranscript}
            className="border-0 bg-orange-50 hover:bg-orange-100"
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isInChatListening
                ? `🎙️ Listening in ${currentLanguage?.nativeName || 'your language'}... Speak your question now`
                : tText('chatInputPlaceholder')
            }
            disabled={loading}
            className={`flex-1 px-2 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent ${
              isInChatListening ? 'bg-orange-50/50 rounded-lg text-orange-950 font-medium' : ''
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Autonomous Agent Application Modal */}
      <AgentApplicationModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        scheme={selectedSchemeForAgent}
      />
    </div>
  );
}
