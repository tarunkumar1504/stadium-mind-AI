import React, { useState, useEffect, useRef } from 'react';
import { api } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome to StadiumPulse AI! ⚽ I am your intelligent stadium guide. How can I assist you with queues, routes, or facilities today?',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  
  const { speak, speakText, setSpeakText, stopSpeaking } = useAccessibility();
  const chatEndRef = useRef(null);
  
  // HTML5 Web Speech API Reference
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'Spanish' ? 'es-ES' : language === 'French' ? 'fr-FR' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const handleSpeechInput = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser. Try Chrome, Edge or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg = { sender: 'user', text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        prompt: trimmed,
        language,
        accessibilityMode: (localStorage.getItem('access-high-contrast') === 'true').toString()
      });

      const botReply = res.data.response;
      
      // Add bot reply
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply,
        timestamp: new Date()
      }]);

      // Read aloud if enabled in context
      speak(botReply);

    } catch (err) {
      console.error('AI chat failed:', err.message);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Apologies, I encountered a communication problem. Please check your connections and try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSend(promptText);
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        sender: 'bot',
        text: 'Welcome back! How can I help you navigate the stadium corridors or concessions now?',
        timestamp: new Date()
      }
    ]);
  };

  const quickPrompts = [
    { label: "🍔 Vegan Concessions", text: "Where can I find vegan food and what are the wait times?" },
    { label: "♿ Accessible Toilets", text: "Is there a wheelchair-accessible restroom near the North or South Tier?" },
    { label: "🚪 Shortest Entry Gate", text: "Which stadium entry gate has the lowest queue wait time right now?" },
    { label: "⚠️ Active Alerts", text: "List any active crowd congestion warnings or stadium notices." }
  ];

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[560px] overflow-hidden">
      
      {/* A. Chat Header */}
      <div className="p-3 border-b border-white/5 bg-gray-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              StadiumPulse AI Assistant <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h3>
            <span className="text-[9px] text-gray-400">Gemini 1.5 Flash • Virtual Concierge</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select 
            id="chat-lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-[10px] bg-gray-950 border border-white/10 rounded-md px-1.5 py-0.5 text-gray-300 focus:outline-none focus:border-emerald-500 accessible-focus"
            aria-label="Select AI speech language"
          >
            <option value="English">English</option>
            <option value="Spanish">Español</option>
            <option value="French">Français</option>
          </select>

          {/* Speak Audio Toggle */}
          <button
            onClick={() => {
              if (speakText) {
                stopSpeaking();
                setSpeakText(false);
              } else {
                setSpeakText(true);
              }
            }}
            className={`p-1.5 rounded-lg border transition-all accessible-focus ${
              speakText 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-gray-950 border-white/10 text-gray-400'
            }`}
            title={speakText ? "Mute Voice guidance" : "Unmute Voice guidance"}
            aria-label="Voice reading controls"
          >
            {speakText ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Reset chat button */}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-gray-950 border border-white/10 text-gray-400 hover:text-white transition-all accessible-focus"
            title="Reset Conversation"
            aria-label="Clear chat log"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* B. Chat Log */}
      <div 
        className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-950/20"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={index}
              className={`flex gap-2.5 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                isBot 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isBot 
                    ? msg.error
                      ? 'bg-red-950/20 border border-red-500/20 text-red-200'
                      : 'bg-gray-900/90 border border-white/5 text-gray-200' 
                    : 'bg-emerald-500 text-black font-semibold'
                }`}>
                  {/* Preserve spacing/linebreaks */}
                  <span className="whitespace-pre-line">{msg.text}</span>
                </div>
                <span className="text-[8px] text-gray-500 block mt-1 px-1.5">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-gray-900 border border-white/5 rounded-2xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* C. Quick prompts section */}
      <div className="px-3 py-1.5 border-t border-white/5 bg-gray-950/40">
        <span className="text-[9px] text-gray-500 font-bold block mb-1">QUICK QUERIES</span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 select-none whitespace-nowrap scroll-thin">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(q.text)}
              className="px-2 py-1 rounded-full bg-gray-900 border border-white/10 hover:border-emerald-500/30 text-gray-300 text-[10px] transition-all accessible-focus shrink-0 font-medium"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* D. Input Bar */}
      <div className="p-3 border-t border-white/5 bg-gray-900/60">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          {/* Speech input toggle */}
          <button
            type="button"
            onClick={handleSpeechInput}
            className={`p-2 rounded-xl border transition-all shrink-0 accessible-focus ${
              isListening 
                ? 'bg-red-500 text-black border-red-500 animate-pulse' 
                : 'bg-gray-950 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak to prompt AI"}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening dictation..." : "Type stadium question here..."}
            className="flex-grow bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-500 accessible-focus"
            disabled={loading}
            aria-label="Stadium assistant search field"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-emerald-400 text-black font-semibold transition-all disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 accessible-focus shrink-0"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
