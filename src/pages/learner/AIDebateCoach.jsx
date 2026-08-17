import React, { useState, useRef, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  IoSend, IoMic, IoMicOff, IoVolumeHigh, IoVolumeMute, IoSparkles, 
  IoArrowDown, IoDownload, IoRefresh, IoCheckmarkCircle, IoWarning, IoDocumentText
} from 'react-icons/io5';
import api from "../../services/api"; 
import { parseDebateResponse } from "../../utils/parseDebateResponse";
const AIDebateCoach = () => {
  const [topic, setTopic] = useState('Universal Basic Income (UBI)');
  const [stance, setStance] = useState('for'); // 'for' or 'against'
  const [opponent, setOpponent] = useState('Socratic Philosopher');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Welcome to the debate arena. The motion is: 'Universal Basic Income (UBI) should be implemented globally to resolve economic displacements.' I see you are representing the FOR stance. I will oppose your arguments. You may open with your first point.",
      time: '12:00 PM',
      fallacies: [],
      counterpoints: []
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([
    "UBI resolves technological unemployment due to AI.",
    "Without UBI, poverty rates will soar as automated labor rises.",
    "A guaranteed safety net stimulates entrepreneurship and consumer spending."
  ]);
  const [counterarguments, setCounterarguments] = useState([
    { label: "Inflation Risk", desc: "Flooding the market with cash leads to supply cost inflation." },
    { label: "Labor Disincentive", desc: "Guaranteed money reduces work-hour output." }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const triggerAIResponse = async (userText) => {
  setIsTyping(true);

  try {
    const token = localStorage.getItem("token");

    const response = await api.post(
  "/ai/chat",
  {
    topic,
    stance,
    user_message: userText,
  },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: parseDebateResponse(response.data.reply),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fallacies: [],
        counterpoints: [],
      },
    ]);

  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "Unable to contact the AI server.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fallacies: [],
        counterpoints: [],
      },
    ]);
  }

  setIsTyping(false);
};

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;
    
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    
    // Simulate AI response
    triggerAIResponse(textToSend);
  };

  const handleMicToggle = () => {
    setIsSpeaking(!isSpeaking);
    if (!isSpeaking) {
      // Simulate listening and typing
      setTimeout(() => {
        setInputVal("Evidence shows UBI experiments in Kenya boosted local micro-enterprise growth.");
        setIsSpeaking(false);
      }, 3000);
    }
  };

  const exportConversation = () => {
    const text = messages.map(m => `[${m.sender.toUpperCase()} - ${m.time}]: ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-session-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      
      {/* Side Settings Form */}
      <Card variant="glass" className="lg:col-span-1 flex flex-col justify-between h-full overflow-y-auto" hoverEffect={false}>
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
              Debate Parameters
            </h3>
            <p className="text-[11px] text-slate-400">Configure your opponent and topic.</p>
          </div>

          <hr className="border-slate-100 dark:border-darkbg-border" />

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Topic Motion</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2.5 text-xs text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Stance Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Your Stance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStance('for')}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  stance === 'for' 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-slate-200 dark:border-darkbg-border hover:bg-slate-50 dark:hover:bg-darkbg-accent text-slate-600 dark:text-slate-350'
                }`}
              >
                PRO (For)
              </button>
              <button
                onClick={() => setStance('against')}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  stance === 'against' 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-slate-200 dark:border-darkbg-border hover:bg-slate-50 dark:hover:bg-darkbg-accent text-slate-600 dark:text-slate-350'
                }`}
              >
                CON (Against)
              </button>
            </div>
          </div>

          {/* Persona selector */}
          <div>
            <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">AI Opponent Persona</label>
            <select
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option>Socratic Philosopher</option>
              <option>Pragmatic Policy Maker</option>
              <option>Analytical statistician</option>
              <option>Aggressive Competitor</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-darkbg-border flex flex-col gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            icon={IoRefresh}
            onClick={() => setMessages([{
              sender: 'ai',
              text: `Reset Arena. The motion is: '${topic}'. Let's begin the round.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fallacies: [],
              counterpoints: []
            }])}
          >
            Reset Debate Round
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            icon={IoDownload}
            onClick={exportConversation}
          >
            Export Chat Logs
          </Button>
        </div>
      </Card>

      {/* Center Chat Arena */}
      <Card variant="glass" className="lg:col-span-2 flex flex-col justify-between h-full p-0 relative" hoverEffect={false}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150/45 dark:border-darkbg-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-250 font-display">Live Sparring Room</span>
              <p className="text-[10px] text-slate-450 truncate max-w-sm">Opponent: {opponent}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-500"
          >
            {isMuted ? <IoVolumeMute className="h-4.5 w-4.5 text-rose-500" /> : <IoVolumeHigh className="h-4.5 w-4.5 text-indigo-500" />}
          </button>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-white dark:bg-darkbg-accent text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-darkbg-border'
                }`}>
                  {typeof msg.text === "string" ? (
  <p>{msg.text}</p>
) : (
  <div className="space-y-4">
    {Object.entries(msg.text).map(([title, value]) => (
      <div
        key={title}
        className="border rounded-xl p-4 bg-white dark:bg-darkbg-accent"
      >
        <h3 className="font-bold text-indigo-600 mb-2">
          {title}
        </h3>

        <pre className="whitespace-pre-wrap text-sm">
          {value}
        </pre>
      </div>
    ))}
  </div>
)}
                  
                  {/* Fallacy Warnings */}
                  {!isUser && msg.fallacies && msg.fallacies.length > 0 && (
                    <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/60 rounded-xl flex items-start gap-1.5 text-rose-700 dark:text-rose-400">
                      <IoWarning className="h-4 w-4 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase">Logical Fallacy Flagged ({msg.fallacies[0].name})</span>
                        <p className="text-[9px] mt-0.5">{msg.fallacies[0].desc}</p>
                      </div>
                    </div>
                  )}

                  <span className={`block text-[9px] mt-2 text-right ${isUser ? 'text-indigo-250' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-2xl px-4 py-3 flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-brand-500 dot-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-brand-500 dot-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-brand-500 dot-bounce" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Replies & Bottom Input */}
        <div className="p-4 border-t border-slate-150/45 dark:border-darkbg-border/60 space-y-3 bg-white/30 dark:bg-darkbg-accent/10">
          
          {/* Tags */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(reply)}
                className="whitespace-nowrap bg-indigo-50 hover:bg-indigo-100 dark:bg-brand-950/40 dark:hover:bg-brand-950/70 border border-indigo-150/50 dark:border-brand-900/60 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-indigo-650 dark:text-brand-350 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Main Input Box */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMicToggle}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                isSpeaking 
                  ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                  : 'border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-500'
              }`}
            >
              {isSpeaking ? <IoMicOff className="h-4.5 w-4.5" /> : <IoMic className="h-4.5 w-4.5" />}
            </button>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
              placeholder={isSpeaking ? "Listening..." : "Type your rebuttal..."}
              disabled={isSpeaking}
              className="flex-1 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button
              onClick={() => handleSend(inputVal)}
              variant="primary"
              size="sm"
              disabled={!inputVal.trim()}
              className="h-10 px-4"
            >
              <IoSend className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Right Sidebar: Fallacies / Rebuttal Helper */}
      <Card variant="glass" className="lg:col-span-1 h-full overflow-y-auto" hoverEffect={false}>
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <IoSparkles className="text-brand-500 h-4.5 w-4.5" />
              Argument Tracker
            </h3>
            <p className="text-[11px] text-slate-400">Rebuttals generated in this round.</p>
          </div>

          <hr className="border-slate-100 dark:border-darkbg-border" />

          {/* Live Counterarguments */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">AI Counter-claims</span>
            
            {counterarguments.map((cp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/45 dark:bg-darkbg-accent/40 border border-slate-100 dark:border-darkbg-border/60">
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-brand-400 uppercase block">{cp.label}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {cp.desc}
                </p>
              </div>
            ))}
          </div>

          <hr className="border-slate-100 dark:border-darkbg-border" />

          {/* Quick tips */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-brand-950/45 to-darkbg-accent border border-brand-900/60 text-xs">
            <h4 className="font-bold text-brand-350 flex items-center gap-1">
              <IoDocumentText className="h-3.5 w-3.5" /> Debater Tip
            </h4>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
              Structure arguments as: **Claim** (your thesis), **Backing** (evidence/studies), and **Impact** (why the audience should care). This makes your case immune to simple rebuttals.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default AIDebateCoach;
