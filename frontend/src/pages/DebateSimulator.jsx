import React, { useState } from 'react';
import { 
  Swords, Send, Sparkles, AlertTriangle, Lightbulb, Clock, 
  RotateCcw, ShieldAlert, Award, Bot, User, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';

export default function DebateSimulator() {
  const [topic, setTopic] = useState("Autonomous AI Systems Should Have Strict Statutory Licensing Requirements");
  const [format, setFormat] = useState("Oxford"); // One-on-One, Parliamentary, Oxford, Policy, Public Forum, AI Debate Simulation
  const [position, setPosition] = useState("Affirmative");
  const [persona, setPersona] = useState("Socratic Scholar");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [turns, setTurns] = useState([
    {
      speaker: "AI Opponent",
      persona: "Socratic Scholar",
      text: "Welcome to this Oxford Debate. As Opposition, I challenge the motion. Statutory licensing stifles rapid open-source innovation and concentrates power in monopolies. How do you justify slowing technological progress?",
      time: "11:40 AM"
    }
  ]);

  const [lastTurnFeedback, setLastTurnFeedback] = useState(null);

  const handleSendTurn = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg = {
      speaker: "User",
      persona: position,
      text: userInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTurns((prev) => [...prev, userMsg]);
    const currentText = userInput;
    setUserInput("");
    setLoading(true);

    try {
      const res = await api.submitDebateTurn({
        topic,
        format,
        user_position: position,
        opponent_persona: persona,
        user_argument: currentText
      });

      setLastTurnFeedback(res);

      const aiMsg = {
        speaker: "AI Opponent",
        persona: persona,
        text: res.opponent_response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setTurns((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback AI response
      const fallbackAiMsg = {
        speaker: "AI Opponent",
        persona: persona,
        text: `[${persona}]: While your argument raises points on safety, it relies heavily on unproven regulatory mechanisms. Empirical evidence suggests self-regulation often yields higher compliance without economic deadweight loss.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTurns((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header Bar */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Swords className="w-6 h-6 text-indigo-400" /> Dynamic AI Debate Simulator
            </h2>
            <p className="text-xs text-slate-400">Multi-turn debate arena with real-time fallacy detection & live Socratic coaching tips.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold border border-indigo-500/30">
              Format: {format}
            </span>
            <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full font-semibold border border-purple-500/30">
              Position: {position}
            </span>
          </div>
        </div>

        {/* Config Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Debate Topic Motion</label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Debate Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="One-on-One">One-on-One</option>
              <option value="Oxford">Oxford Debate</option>
              <option value="Parliamentary">Parliamentary</option>
              <option value="Policy">Policy Debate</option>
              <option value="Public Forum">Public Forum</option>
              <option value="AI Debate Simulation">AI Debate Simulation</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Persona</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Socratic Scholar">Socratic Scholar</option>
              <option value="Aggressive Pragmatist">Aggressive Pragmatist</option>
              <option value="Policy Expert">Policy Expert</option>
              <option value="Philosophical Analyst">Philosophical Analyst</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Debate Arena & Side Coach Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debate Chat Log (2 Cols) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-[580px] lg:col-span-2">
          <div className="overflow-y-auto space-y-4 pr-2 flex-1">
            {turns.map((turn, index) => {
              const isUser = turn.speaker === "User";
              return (
                <div 
                  key={index}
                  className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-md p-4 rounded-2xl space-y-1 text-xs ${
                    isUser 
                      ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-100 rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>{turn.speaker} ({turn.persona})</span>
                      <span>{turn.time}</span>
                    </div>
                    <p className="leading-relaxed">{turn.text}</p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-indigo-300 font-medium animate-pulse">
                <Bot className="w-4 h-4 text-purple-400" /> AI Opponent is formulating counter-rebuttal...
              </div>
            )}
          </div>

          {/* User Input Form */}
          <form onSubmit={handleSendTurn} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your rebuttal or argument here..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="gradient-btn px-6 py-3 rounded-2xl font-bold text-xs text-white flex items-center gap-2 shadow-lg"
            >
              Submit Turn <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Live AI Coaching Side Panel */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Live AI Debate Coach
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
              Real-time Assistant
            </span>
          </div>

          {lastTurnFeedback ? (
            <div className="space-y-4">
              {/* Turn Score */}
              <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-800/40 flex items-center justify-between">
                <span className="text-xs text-indigo-200 font-semibold">Turn Score</span>
                <span className="text-base font-extrabold text-emerald-400">{lastTurnFeedback.current_turn_score}%</span>
              </div>

              {/* Coaching Tip */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Coach Suggestion</p>
                <p className="text-xs text-slate-300">{lastTurnFeedback.live_coaching_tip}</p>
              </div>

              {/* Fallacies Warning */}
              {lastTurnFeedback.detected_fallacies_in_user_turn?.length > 0 ? (
                <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-800/40 space-y-1">
                  <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Fallacy Warning
                  </p>
                  {lastTurnFeedback.detected_fallacies_in_user_turn.map((f, i) => (
                    <p key={i} className="text-xs text-rose-200">
                      • Detected <span className="font-bold">{f.fallacy_type}</span>: {f.explanation}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-800/30 flex items-center gap-2 text-xs text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Zero logical fallacies in last turn!
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 space-y-3 py-6 text-center">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
              <p>Submit your first turn to receive real-time coaching tips, turn scoring, and fallacy alerts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
