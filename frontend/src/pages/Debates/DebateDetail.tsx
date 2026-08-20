import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { debatesAPI, argumentsAPI, scoringAPI, reportsAPI } from '../../api/client';
import type { DebateSession, Argument, DebateScore } from '../../types';

const DebateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [debate, setDebate] = useState<DebateSession | null>(null);
  const [scores, setScores] = useState<DebateScore[]>([]);
  const [debateArgs, setDebateArgs] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(true);
  const [argumentContent, setArgumentContent] = useState('');
  const [argumentPosition, setArgumentPosition] = useState('pro');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      debatesAPI.get(Number(id)),
      scoringAPI.getSessionScores(Number(id)).catch(() => ({ data: [] })),
      argumentsAPI.getBySession(Number(id)).catch(() => ({ data: [] })),
    ])
      .then(([debateRes, scoresRes, argsRes]) => {
        setDebate(debateRes.data);
        setScores(scoresRes.data);
        setDebateArgs(argsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const submitArgument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !argumentContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await argumentsAPI.create({
        session_id: Number(id),
        content: argumentContent,
        position: argumentPosition,
      });
      setArgumentContent('');
      // refresh arguments
      const updatedArgs = await argumentsAPI.getBySession(Number(id));
      setDebateArgs(updatedArgs.data);
      alert('Argument submitted and processed through NLP pipeline!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit argument');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    if (!id) return;
    try {
      const res = await reportsAPI.debatePDF(Number(id));
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `debate_${id}_report.pdf`;
      a.click();
    } catch {
      alert('Could not download PDF report.');
    }
  };

  const downloadExcel = async () => {
    if (!id) return;
    try {
      const res = await reportsAPI.debateExcel(Number(id));
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `debate_${id}_scores.xlsx`;
      a.click();
    } catch {
      alert('Could not download Excel report.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading Debate Session Details & Rubrics...</p>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="card text-center py-16 space-y-3">
        <p className="text-slate-400 text-sm">Debate session not found.</p>
        <Link to="/debates" className="btn-primary text-xs py-2 px-4 inline-block">
          ← Back to Debates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Session Title Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
        <Link to="/debates" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1">
          ← Back to All Debate Sessions
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                Session #{debate.id}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase font-mono">
                {debate.format.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {debate.topic}
            </h1>
          </div>

          <div className="flex sm:flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
              debate.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              {debate.status}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ⏱️ {debate.duration_minutes} min round
            </span>
          </div>
        </div>
      </div>

      {/* Submit New Argument to Round */}
      {debate.status !== 'completed' && debate.status !== 'cancelled' && (
        <form onSubmit={submitArgument} className="card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>✍️</span> Submit Argument Round Speech
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your constructive speech or rebuttal. The AI agent pipeline will automatically analyze clarity, extract claims, and check for fallacies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advocacy Position Stance *
              </label>
              <select
                value={argumentPosition}
                onChange={(e) => setArgumentPosition(e.target.value)}
                className="input-field text-sm"
              >
                <option value="pro">✅ Pro (Affirmative Proposition)</option>
                <option value="con">❌ Con (Negative Opposition)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Designates which bench your argument supports</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Constructive Argument Content *
            </label>
            <textarea
              value={argumentContent}
              onChange={(e) => setArgumentContent(e.target.value)}
              className="input-field min-h-[140px] text-sm"
              placeholder="Structure: 1) Claim, 2) Warrant/Reasoning, 3) Empirical Evidence, 4) Impact & Clash..."
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Supports full multi-paragraph speeches, philosophical arguments, and statistical evidence citations.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !argumentContent.trim()}
            className="btn-primary text-xs font-bold py-2.5 px-5 shadow-sm"
          >
            {submitting ? 'Analyzing with AI Pipeline...' : 'Submit Argument to Round →'}
          </button>
        </form>
      )}

      {/* Comprehensive Rubric Evaluation Card */}
      {scores.length > 0 && (
        <div className="card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> Formal Evaluation Rubrics & Scores
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5-dimensional standardized competitive debate scoring rubric.
              </p>
            </div>
            
            {/* Export Reports Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={downloadPDF}
                className="btn-secondary text-xs py-1.5 px-3 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                title="Download formatted executive PDF debate summary"
              >
                📄 PDF Report
              </button>
              <button
                onClick={downloadExcel}
                className="btn-secondary text-xs py-1.5 px-3 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                title="Export comprehensive numerical scores spreadsheet"
              >
                📊 Excel Data
              </button>
            </div>
          </div>

          {scores.map((s) => (
            <div key={s.id} className="space-y-4">
              
              {/* 5 Criteria Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Argument Quality</span>
                  <p className="text-xl font-black text-indigo-600 mt-1">{s.argument_quality.toFixed(1)}</p>
                  <span className="text-[9px] text-slate-400">Claim validity</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Evidence Usage</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{s.evidence_usage.toFixed(1)}</p>
                  <span className="text-[9px] text-slate-400">Factual support</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Logical Consistency</span>
                  <p className="text-xl font-black text-purple-600 mt-1">{s.logical_consistency.toFixed(1)}</p>
                  <span className="text-[9px] text-slate-400">Fallacy-free</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Rebuttal Efficacy</span>
                  <p className="text-xl font-black text-amber-600 mt-1">{s.rebuttal_effectiveness.toFixed(1)}</p>
                  <span className="text-[9px] text-slate-400">Direct clash</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Communication</span>
                  <p className="text-xl font-black text-teal-600 mt-1">{s.communication_skills.toFixed(1)}</p>
                  <span className="text-[9px] text-slate-400">Rhetoric & tone</span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-300 text-center bg-emerald-50">
                  <span className="text-[10px] text-emerald-800 font-bold block">Overall Composite</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">{s.overall_score.toFixed(1)}</p>
                  <span className="text-[9px] text-emerald-600 font-mono font-bold">/ 10.0</span>
                </div>
              </div>

              {s.feedback && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700">
                  💬 Judge Feedback: "{s.feedback}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submitted Arguments List with Analysis Links */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>📝</span> Submitted Arguments & Speeches ({debateArgs.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Deep NLP & Fallacy Analysis" on any argument to trigger the 4-agent AI pipeline.
            </p>
          </div>
        </div>

        {debateArgs.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">
            No arguments submitted yet. Submit an affirmative or negative speech above!
          </p>
        ) : (
          <div className="space-y-3">
            {debateArgs.map((arg) => (
              <div
                key={arg.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      arg.position === 'pro'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {arg.position === 'pro' ? '✅ PRO AFFIRMATIVE' : '❌ CON NEGATIVE'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">Argument #{arg.id}</span>
                  </div>

                  <Link
                    to={`/arguments/${arg.id}`}
                    className="btn-primary text-xs py-1.5 px-3 font-semibold shadow-xs"
                  >
                    🔍 Deep NLP & Fallacy Analysis →
                  </Link>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed line-clamp-3">
                  {arg.content}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-mono">
                  {arg.clarity_score > 0 && <span>Clarity: <strong className="text-indigo-600">{arg.clarity_score.toFixed(1)}</strong></span>}
                  {arg.relevance_score > 0 && <span>Relevance: <strong className="text-blue-600">{arg.relevance_score.toFixed(1)}</strong></span>}
                  {arg.persuasiveness > 0 && <span>Persuasion: <strong className="text-emerald-600">{arg.persuasiveness.toFixed(1)}</strong></span>}
                  {arg.created_at && (
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {new Date(arg.created_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DebateDetail;


