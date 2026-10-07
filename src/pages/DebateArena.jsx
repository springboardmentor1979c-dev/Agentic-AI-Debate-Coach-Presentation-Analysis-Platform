import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Send, CheckCircle, HelpCircle, Trophy, BookOpen, User, Flame, Compass, MessageSquare, AlertCircle, Compass as CompassIcon, Compass as PersonalityIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DebateArena = () => {
  // Debate Config State
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('One-on-One');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [personality, setPersonality] = useState('Friendly Coach');
  const [position, setPosition] = useState('Affirmative');
  
  // Game Play State
  const [inProgress, setInProgress] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStance, setAiStance] = useState('Negative');
  const [coaching, setCoaching] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute timer

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debate session Timer
  useEffect(() => {
    if (inProgress && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleEndDebate();
    }
    return () => clearInterval(timerRef.current);
  }, [inProgress, timeLeft]);

  const handleStartDebate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setSummaryReport(null);
    setCoaching(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/debate/start`, {
        topic,
        format,
        difficulty,
        personality,
        position
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setSessionId(data.session_id);
      setAiStance(data.ai_stance);
      setMessages([
        { speaker: 'ai', message: data.ai_opening }
      ]);
      setInProgress(true);
      setTimeLeft(180);
    } catch (err) {
      console.error('Error starting debate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;
    const userMsg = userInput;
    setUserInput('');
    setLoading(true);

    // Optimistically update message
    setMessages((prev) => [...prev, { speaker: 'user', message: userMsg }]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/debate/respond`, {
        session_id: sessionId,
        message: userMsg
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setMessages((prev) => [...prev, { speaker: 'ai', message: data.rebuttal }]);
      setCoaching(data.coaching);
      setPerformance(data.performance);
    } catch (err) {
      console.error('Error in debate response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndDebate = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/debate/end`, {
        session_id: sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setMessages((prev) => [...prev, { speaker: 'ai', message: data.ai_closing }]);
      setSummaryReport(data);
      setInProgress(false);
    } catch (err) {
      console.error('Error ending debate:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          AI Debate Simulation Arena
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Engage in dynamic, multi-turn verbal training matches against customized AI personas.
        </p>
      </div>

      {!inProgress && !summaryReport ? (
        /* Configuration Screen */
        <div className="max-w-3xl mx-auto glass-panel p-8 border border-white/5 rounded-3xl space-y-6 bg-gradient-to-br from-slate-900/50 to-purple-950/10">
          <h2 className="text-xl font-bold text-purple-300 flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <Flame className="w-5 h-5 text-purple-400" />
            Debate Configuration
          </h2>
          
          <div className="space-y-4">
            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Select/Enter Debate Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Universal Basic Income is necessary to stabilize the economy"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-purple-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Debate Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="One-on-One">One-on-One Match</option>
                  <option value="Oxford">Oxford Debate</option>
                  <option value="Public Forum">Public Forum</option>
                  <option value="Policy Debate">Policy Debate</option>
                  <option value="Parliamentary Debate">Parliamentary</option>
                </select>
              </div>

              {/* Personality selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">AI Personality</label>
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                >
                  <option value="Friendly Coach">Friendly Coach (Warm & Guiding)</option>
                  <option value="Aggressive Opponent">Aggressive Opponent (Sharp & Interrogative)</option>
                  <option value="Professional Judge">Professional Judge (Structured & Logical)</option>
                  <option value="Critical Thinker">Critical Thinker (Deconstructive)</option>
                  <option value="Scientist">Scientist (Highly Empirical)</option>
                  <option value="Lawyer">Lawyer (Precedent & Analogy)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                <div className="flex gap-2">
                  {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                        difficulty === d
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stance Stance selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Your Position</label>
                <div className="flex gap-2">
                  {['Affirmative', 'Negative'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPosition(p)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                        position === p
                          ? 'bg-blue-600/30 text-blue-200 border-blue-500'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartDebate}
            disabled={loading || !topic.trim()}
            className="w-full mt-6 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Enter Arena & Begin Debate
          </button>
        </div>
      ) : inProgress ? (
        /* Live Debate Interface */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Stream */}
          <div className="lg:col-span-2 glass-panel border border-white/5 rounded-3xl flex flex-col h-[650px] overflow-hidden bg-slate-950/20">
            {/* Header info */}
            <div className="border-b border-white/5 p-4 flex justify-between items-center bg-slate-900/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest">{format} format</span>
                <h3 className="text-sm font-bold text-white truncate max-w-sm">{topic}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">Time Left: <span className="text-red-400 font-bold">{formatTime(timeLeft)}</span></span>
                <button
                  onClick={handleEndDebate}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition font-semibold"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[80%] ${m.speaker === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    m.speaker === 'user' ? 'bg-blue-600/30 text-blue-300' : 'bg-purple-600/30 text-purple-300'
                  }`}>
                    {m.speaker === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    m.speaker === 'user'
                      ? 'bg-blue-600/10 text-slate-100 border border-blue-500/20'
                      : 'bg-purple-950/10 text-slate-200 border border-purple-500/10'
                  }`}>
                    {m.message}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                    AI
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Textbox input */}
            <div className="p-4 border-t border-white/5 bg-slate-900/40 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your debate response or rebuttal here..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !userInput.trim()}
                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Coaching Sidepanel */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-6 h-[650px] overflow-y-auto">
            <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2 border-b border-white/5 pb-2">
              <Flame className="w-5 h-5 text-purple-400" />
              Round Coaching Tips
            </h2>

            {coaching ? (
              <div className="space-y-6 text-xs">
                {/* Scores visual */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Metrics</span>
                  {Object.entries(coaching.scores || {}).map(([metric, val]) => (
                    <div key={metric} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
                        <span>{metric}</span>
                        <span>{val}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-3 border-t border-white/5 pt-3">
                  <div>
                    <span className="font-bold text-emerald-400 block mb-1">Strengths</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {coaching.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-pink-400 block mb-1">Weaknesses</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {coaching.weaknesses?.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Better Wording suggestions */}
                <div className="bg-slate-900/50 p-4 border border-white/5 rounded-xl space-y-1.5">
                  <span className="font-bold text-blue-400 uppercase tracking-widest text-[9px] block">Better Wording Alternative</span>
                  <p className="text-slate-200 leading-relaxed font-serif">"{coaching.better_wording}"</p>
                </div>

                {/* Speaking advice */}
                <div className="space-y-1">
                  <span className="font-bold text-purple-400 uppercase tracking-wider text-[9px] block">Speaking Coach Advice</span>
                  <p className="text-slate-300 leading-relaxed">{coaching.speaking_advice}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 space-y-2">
                <Flame className="w-10 h-10 text-slate-700 animate-pulse" />
                <p className="text-xs">Submit your first debate argument response to observe coaching analytics.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Summary Report screen */
        <div className="max-w-4xl mx-auto glass-panel p-8 border border-white/5 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Debate Match Completed!</h2>
              <p className="text-xs text-slate-400">Review your final coaching scores and closing summary below.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-6 rounded-2xl space-y-3">
            <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">AI Opponent's Closing Statement</span>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {summaryReport.ai_closing}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSummaryReport(null);
                setInProgress(false);
              }}
              className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-sm transition"
            >
              Start New Debate Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateArena;
