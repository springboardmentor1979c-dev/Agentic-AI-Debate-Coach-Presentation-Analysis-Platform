import React, { useState } from 'react';
import { aiDebateAPI } from '../../api/client';
import type { AIDebateStart, AIDebateTurn, AIDebateEnd, AIDebateHistory } from '../../types';

interface Message {
  role: 'user' | 'ai';
  content: string;
  turn?: number;
}

const AIDebateChat: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [position, setPosition] = useState('pro');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [debateEnded, setDebateEnded] = useState(false);
  const [finalResult, setFinalResult] = useState<AIDebateEnd | null>(null);
  const [history, setHistory] = useState<AIDebateHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const sampleTopics = [
    'Should Artificial Intelligence replace human judges in legal decisions?',
    'Is remote work fundamentally more productive than in-office work?',
    'Should standardized testing be eliminated from college admissions?',
    'Should social media platforms be legally classified as public utilities?',
  ];

  const startDebate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setMessages([]);
    setDebateEnded(false);
    setFinalResult(null);
    try {
      const res = await aiDebateAPI.start({ topic, user_position: position });
      const data: AIDebateStart = res.data;
      setSessionId(data.session_id);
      setMessages([{ role: 'ai', content: data.ai_opening, turn: 0 }]);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to start AI debate.');
    } finally {
      setLoading(false);
    }
  };

  const sendTurn = async () => {
    if (!userInput.trim() || !sessionId) return;
    const userMsg: Message = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await aiDebateAPI.turn(sessionId, userMsg.content);
      const data: AIDebateTurn = res.data;
      setMessages((prev) => [...prev, { role: 'ai', content: data.ai_response, turn: data.turn }]);

      if (data.tip && data.tip.includes('end')) {
        setTimeout(() => endDebate(), 500);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to get AI response.');
    } finally {
      setLoading(false);
    }
  };

  const endDebate = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await aiDebateAPI.end(sessionId);
      setFinalResult(res.data);
      setDebateEnded(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to end debate.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      try {
        const res = await aiDebateAPI.history();
        setHistory(res.data);
      } catch { /* ignore */ }
    }
  };

  const resetDebate = () => {
    setSessionId(null);
    setMessages([]);
    setDebateEnded(false);
    setFinalResult(null);
    setTopic('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Header with Explanatory Presentation Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              🤖 AI Debate Sparring Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive LLM Opponent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-turn debate sparring powered by LLM counterarguments, rebuttal analysis & automated scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="btn-secondary text-xs py-2 px-3"
            title="Inspect previous sparring transcripts and scores"
          >
            {showHistory ? '✕ Close Log' : '📜 Sparring History'}
          </button>
        </div>
      </div>

      {/* Past History Drawer */}
      {showHistory && (
        <div className="card border-indigo-100 bg-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700">
              Archived AI Sparring Sessions
            </h3>
            <span className="text-[10px] text-slate-400">{history.length} records found</span>
          </div>

          {history.length === 0 ? (
            <p className="text-slate-400 text-xs py-4 text-center">No past sparring sessions recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="truncate flex-1 mr-3">
                    <p className="font-semibold text-slate-800 truncate">{h.topic}</p>
                    <p className="text-[10px] text-slate-500">{h.turns} turns completed</p>
                  </div>
                  <span className={`font-black font-mono px-2.5 py-1 rounded-lg text-xs ${
                    h.score && h.score >= 7
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {h.score ? `${h.score.toFixed(1)} / 10` : 'Incomplete'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!sessionId ? (
        /* Configuration Stage */
        <div className="card space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">1. Configure Your Debate Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or type a controversial proposition and choose your advocacy stance.
            </p>
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Debate Motion / Proposition *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., Should Artificial Intelligence be granted legal rights?"
            />
            <p className="text-[10px] text-slate-400">
              Or select one of our curated prompt motions below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(t)}
                  className="text-left text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 transition-all shadow-2xs"
                >
                  💡 {t}
                </button>
              ))}
            </div>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Position Stance *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPosition('pro')}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  position === 'pro'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">✅ Affirmative (PRO)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Advocate</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You defend the motion. The AI will adopt a critical opposition role.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPosition('con')}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  position === 'con'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">❌ Negative (CON)</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">Oppose</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  You challenge the motion. The AI will advocate for the proposition.
                </p>
              </button>
            </div>
          </div>

          <button
            onClick={startDebate}
            disabled={loading || !topic.trim()}
            className="btn-primary w-full py-3 text-sm font-bold shadow-sm"
          >
            {loading ? 'Initializing AI Agent...' : '🎯 Launch AI Sparring Round →'}
          </button>
        </div>
      ) : (
        /* Live Sparring Chat Studio */
        <div className="card p-0 overflow-hidden shadow-md">
          {/* Active Debate Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                Active Sparring Session #{sessionId}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">{topic}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                position === 'pro'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                Your Role: {position === 'pro' ? 'Affirmative (PRO)' : 'Negative (CON)'}
              </span>
            </div>
          </div>

          {/* Chat Stream Messages */}
          <div className="p-4 sm:p-6 space-y-4 min-h-[340px] max-h-[480px] overflow-y-auto bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-brand-700 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className={`flex items-center justify-between gap-3 text-[10px] mb-1.5 font-mono ${
                    msg.role === 'user' ? 'text-indigo-100' : 'text-slate-500 font-bold'
                  }`}>
                    <span>
                      {msg.role === 'user' ? '👤 YOU (Advocate)' : `🤖 AI OPPONENT (Turn ${msg.turn ?? 0})`}
                    </span>
                    <span>{msg.role === 'user' ? 'Argument Stance' : 'Rebuttal Counter'}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>AI is formulating logical rebuttal & evaluating fallacies...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Turn Input Bar */}
          {!debateEnded && (
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTurn()}
                  className="input-field flex-1 text-sm"
                  placeholder="Present your counter-argument with reasoning & evidence..."
                  disabled={loading}
                />
                <button
                  onClick={sendTurn}
                  disabled={loading || !userInput.trim()}
                  className="btn-primary px-5 text-xs font-bold shadow-sm"
                >
                  Send Argument ↵
                </button>
                <button
                  onClick={endDebate}
                  disabled={loading}
                  className="btn-danger px-4 text-xs font-bold"
                  title="Conclude round and trigger comprehensive AI rubric evaluation"
                >
                  Conclude & Score
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                💡 Tip: State your claim, present logic or evidence, and explicitly address the opponent's previous counterpoint.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Evaluation Results */}
      {finalResult && (
        <div className="card border-2 border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Evaluation Complete
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">📊 AI Sparring Evaluation Scorecard</h2>
            </div>
            <button onClick={resetDebate} className="btn-primary text-xs py-2 px-3 shadow-sm">
              Start New Debate Round 🔄
            </button>
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Overall Debate Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-black text-emerald-600 font-mono">
                  {finalResult.final_score.toFixed(1)}
                </p>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Composite evaluation of logic consistency, rebuttal efficacy and claim clarity.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Sparring Exchange Volume</span>
              <p className="text-4xl font-black text-indigo-600 font-mono mt-1">
                {finalResult.turns_completed}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Total interactive rebuttal turns executed during this session.
              </p>
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              AI Coach Executive Summary
            </h4>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "{finalResult.feedback}"
            </p>
          </div>

          {/* Strengths and Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>✅</span> Demonstrated Strengths
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {finalResult.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📈</span> Focus & Refinement Areas
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {finalResult.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIDebateChat;


