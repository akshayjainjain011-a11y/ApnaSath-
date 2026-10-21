import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  BookOpen,
  Wind,
  Scroll,
  Smile,
  HelpCircle,
  Database,
  Trash2,
  AlertTriangle,
  Info,
  Check,
  ChevronRight,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS, speakText } from '../i18n';

interface AiSaathiViewProps {
  currentUser: any;
  currentLanguage: SupportedLanguage;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
}

interface MemoryItem {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
}

export const AiSaathiView: React.FC<AiSaathiViewProps> = ({
  currentUser,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [suggestedMemory, setSuggestedMemory] = useState<string | null>(null);
  const [crisisAlert, setCrisisAlert] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history and memories on mount
  useEffect(() => {
    fetchHistory();
    fetchMemories();
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/saathi/history');
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Welcome message if fresh
        const welcomeText = `Namaste ${currentUser?.name || ''}ji! Main aapka AI Saathi hoon. Aaj aapka din kaisa raha? Kahiye toh koi manpasand kissa sunein, geet gungunayein, ya bas aaram se dil ki baatein karein?`;
        setMessages([
          {
            id: 'init_welcome',
            role: 'assistant',
            text: welcomeText,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/saathi/memories');
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch (e) {
      console.warn('Failed to load memories', e);
    }
  };

  const handleSendMessage = async (textToSend?: string, mode?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !mode) return;

    setInputText('');
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: mode ? `[Action: ${mode}]` : text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedMemory(null);

    try {
      const res = await fetch('/api/saathi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: currentLanguage,
          mode,
        }),
      });

      const data = await res.json();
      if (data.isCrisisAlert) {
        setCrisisAlert(true);
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak first sentence for senior convenience
      speakText(data.text, currentLanguage);
      setIsSpeaking(true);

      if (data.suggestedMemory) {
        setSuggestedMemory(data.suggestedMemory);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: 'Kripya thoda dhairya rakhein. Main aapke sath hoon. Kahiye toh dobara koshish karein?',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToggle = (textToSpeak: string) => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      speakText(textToSpeak, currentLanguage);
      setIsSpeaking(true);
    }
  };

  // Browser Speech-to-text recognition
  const handleMicToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported on modern browsers (Chrome, Edge, Safari).');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage === 'English' ? 'en-IN' : 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  const handleSaveMemory = async (content: string) => {
    try {
      await fetch('/api/saathi/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Saved Preference', content }),
      });
      fetchMemories();
      setSuggestedMemory(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/saathi/memories/${id}`, { method: 'DELETE' });
      fetchMemories();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Kya aap saari baatcheet mitana chahte hain? (Are you sure you want to clear your chat history?)')) {
      await fetch('/api/saathi/clear-history', { method: 'POST' });
      setMessages([]);
      fetchHistory();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-[calc(100vh-120px)] min-h-[550px]">
      {/* Top Companion Bar */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF8EE] to-[#F5ECE0] border border-amber-200/90 shadow-2xs mb-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/apnasaath_ai_companion_1792601942145.jpg"
              alt="AI Saathi Diya"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                AI Saathi (आपका साथी)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                {currentLanguage}
              </span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-1">
              {t.aiTransparentNote}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Memories */}
          <button
            onClick={() => setShowMemoryModal(true)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Saved topics & preferences"
          >
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Memories ({memories.length})</span>
          </button>

          {/* Clear history */}
          <button
            onClick={handleClearHistory}
            className="min-h-[44px] px-2.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-500 hover:text-red-700 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Distress / Crisis Banner */}
      {crisisAlert && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <div className="font-bold text-base">You are valued and supported.</div>
            <p>
              If you or someone you know is in deep distress, please reach out to our toll-free 24/7 care partners right away:
            </p>
            <div className="flex flex-wrap gap-3 pt-1 font-semibold text-red-800">
              <a href="tel:14567" className="underline hover:text-red-950">
                📞 National Elderline: 14567
              </a>
              <a href="tel:18005990019" className="underline hover:text-red-950">
                📞 KIRAN Mental Health: 1800-599-0019
              </a>
              <a href="tel:112" className="underline hover:text-red-950">
                📞 Emergency: 112
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Memory Prompt */}
      {suggestedMemory && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Would you like AI Saathi to remember this preference? <em>"{suggestedMemory}"</em></span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleSaveMemory(suggestedMemory)}
              className="px-3 py-1 rounded-lg bg-amber-800 text-white font-medium hover:bg-amber-900 transition-colors"
            >
              Remember
            </button>
            <button
              onClick={() => setSuggestedMemory(null)}
              className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-stone-50/70 border border-stone-200/80 mb-3 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-xs mt-1">
                  सा
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-xs leading-relaxed text-sm sm:text-base ${
                  isUser
                    ? 'bg-amber-900 text-white rounded-tr-xs'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                    <button
                      onClick={() => handleSpeechToggle(msg.text)}
                      className="inline-flex items-center gap-1.5 font-medium text-amber-800 hover:text-amber-950 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t.listenToThis}</span>
                    </button>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-800 text-amber-100 flex items-center justify-center shrink-0 font-serif font-bold text-sm">
              सा
            </div>
            <div className="p-4 rounded-3xl bg-white border border-stone-200 text-stone-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>AI Saathi is thinking thoughtfully in {currentLanguage}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Senior Conversation Starters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        <button
          onClick={() => handleSendMessage(undefined, 'story')}
          className="min-h-[44px] px-3.5 py-1.5 rounded-2xl bg-white hover:bg-amber-50 border border-amber-300 text-stone-800 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>Heartwarming Story</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'breathing')}
          className="min-h-[44px] px-3.5 py-1.5 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-300 text-stone-800 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Wind className="w-4 h-4 text-emerald-700" />
          <span>1-Min Gentle Breathing</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'poetry')}
          className="min-h-[44px] px-3.5 py-1.5 rounded-2xl bg-white hover:bg-amber-50 border border-amber-300 text-stone-800 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Scroll className="w-4 h-4 text-amber-700" />
          <span>Poem & Shlok</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'quiz')}
          className="min-h-[44px] px-3.5 py-1.5 rounded-2xl bg-white hover:bg-orange-50 border border-orange-300 text-stone-800 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Smile className="w-4 h-4 text-orange-700" />
          <span>Old Cinema Trivia</span>
        </button>
      </div>

      {/* Input Box with Voice & Send */}
      <div className="relative shrink-0 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicToggle}
            className={`min-h-[52px] min-w-[52px] rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
            }`}
            title="Dictate with voice / बोलकर लिखें"
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-amber-800" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Say or type anything in ${currentLanguage}...`}
            className="flex-1 min-h-[52px] px-5 rounded-2xl bg-white border-2 border-stone-300 focus:border-amber-700 focus:outline-hidden text-base text-stone-900 shadow-2xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="min-h-[52px] min-w-[56px] px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-semibold transition-colors flex items-center justify-center shadow-xs"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Memory Management Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  AI Saathi Saved Memories
                </h3>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500 py-3">
              Under Indian DPDP Act principles, you hold full control over saved personal preferences. You can inspect or permanently delete any item anytime.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {memories.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-sm">
                  No memories saved yet. AI Saathi asks before saving preferences.
                </div>
              ) : (
                memories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-stone-900 text-xs text-amber-900">
                        {m.topic}
                      </div>
                      <div className="text-stone-700 mt-0.5">{m.content}</div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Saved: {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Permanently Delete Memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
