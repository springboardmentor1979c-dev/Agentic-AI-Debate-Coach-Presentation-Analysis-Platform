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
        // Auto-end after enough turns
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Debate Simulation</h1>
          <p className="text-gray-500 mt-1">Practice debating against an AI opponent</p>
        </div>
        <button onClick={loadHistory} className="btn-secondary text-sm">
          {showHistory ? 'Hide History' : '📜 Past Debates'}
        </button>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">Past AI Debates</h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No past debates found.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium truncate flex-1">{h.topic}</span>
                  <span className="text-gray-500 mx-2">{h.turns} turns</span>
                  <span className={`font-semibold ${h.score && h.score >= 7 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {h.score?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!sessionId ? (
        /* Start Debate Form */
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-800">Configure Your Debate</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Debate Topic *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field"
              placeholder="e.g., Is remote work more productive than office work?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Position</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPosition('pro')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  position === 'pro' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✅ Pro (For)
              </button>
              <button
                onClick={() => setPosition('con')}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  position === 'con' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ❌ Con (Against)
              </button>
            </div>
          </div>
          <button onClick={startDebate} disabled={loading || !topic.trim()} className="btn-primary w-full py-3">
            {loading ? 'Starting...' : '🎯 Start AI Debate'}
          </button>
        </div>
      ) : (
        /* Debate Chat */
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-indigo-50">
            <p className="font-semibold text-gray-800">Debating: {topic}</p>
            <p className="text-sm text-gray-500">Your position: {position === 'pro' ? 'Pro ✅' : 'Con ❌'}</p>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs opacity-70 mb-1">
                    {msg.role === 'user' ? 'You' : `AI (Turn ${msg.turn ?? ''})`}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl p-3 text-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {!debateEnded && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTurn()}
                  className="input-field flex-1"
                  placeholder="Type your argument..."
                  disabled={loading}
                />
                <button onClick={sendTurn} disabled={loading || !userInput.trim()} className="btn-primary">
                  Send
                </button>
                <button onClick={endDebate} disabled={loading} className="btn-danger">
                  End
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Results */}
      {finalResult && (
        <div className="card border-2 border-green-200 bg-green-50">
          <h2 className="font-semibold text-gray-800 mb-3">📊 Debate Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Final Score</p>
              <p className="text-3xl font-bold text-brand-600">{finalResult.final_score.toFixed(1)}</p>
              <p className="text-sm text-gray-500">/ 10.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Turns Completed</p>
              <p className="text-2xl font-bold">{finalResult.turns_completed}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 italic mb-3">"{finalResult.feedback}"</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-green-700 mb-1">✅ Strengths</p>
              <ul className="list-disc list-inside text-gray-600">
                {finalResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium text-orange-700 mb-1">📈 Improvements</p>
              <ul className="list-disc list-inside text-gray-600">
                {finalResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
          <button onClick={resetDebate} className="btn-primary mt-4">
            Start New Debate
          </button>
        </div>
      )}
    </div>
  );
};

export default AIDebateChat;

