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
      await argumentsAPI.create({
        session_id: Number(id),
        content: argumentContent,
        position: argumentPosition,
      });
      setArgumentContent('');
      alert('Argument submitted! Analysis in progress.');
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Debate session not found.</p>
        <Link to="/debates" className="text-brand-600 mt-2 inline-block">← Back to Debates</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/debates" className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block">
          ← Back to Debates
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{debate.topic}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span>Format: {debate.format.replace('_', ' ')}</span>
          <span>•</span>
          <span>Status: {debate.status}</span>
          <span>•</span>
          <span>{debate.duration_minutes} min</span>
        </div>
      </div>

      {/* Submit Argument */}
      {debate.status !== 'completed' && debate.status !== 'cancelled' && (
        <form onSubmit={submitArgument} className="card space-y-4">
          <h2 className="font-semibold text-gray-800">Submit an Argument</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={argumentPosition}
              onChange={(e) => setArgumentPosition(e.target.value)}
              className="input-field"
            >
              <option value="pro">Pro (For)</option>
              <option value="con">Con (Against)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Argument</label>
            <textarea
              value={argumentContent}
              onChange={(e) => setArgumentContent(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="Present your argument with reasoning and evidence..."
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Argument'}
          </button>
        </form>
      )}

      {/* Scores */}
      {scores.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Scores & Evaluation</h2>
            <div className="flex gap-2">
              <button onClick={downloadPDF} className="btn-secondary text-sm py-1.5 px-3">
                📄 PDF
              </button>
              <button onClick={downloadExcel} className="btn-secondary text-sm py-1.5 px-3">
                📊 Excel
              </button>
            </div>
          </div>
          {scores.map((s) => (
            <div key={s.id} className="border-t border-gray-100 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Argument Quality</span>
                  <p className="font-semibold">{s.argument_quality.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Evidence Usage</span>
                  <p className="font-semibold">{s.evidence_usage.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Logical Consistency</span>
                  <p className="font-semibold">{s.logical_consistency.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rebuttal Effectiveness</span>
                  <p className="font-semibold">{s.rebuttal_effectiveness.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Communication</span>
                  <p className="font-semibold">{s.communication_skills.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Overall</span>
                  <p className="font-semibold text-brand-600 text-lg">{s.overall_score.toFixed(1)}</p>
                </div>
              </div>
              {s.feedback && (
                <p className="text-sm text-gray-600 mt-3 italic">"{s.feedback}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submitted Arguments */}
      {debateArgs.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">📝 Submitted Arguments</h2>
          <div className="space-y-3">
            {debateArgs.map((arg) => (
              <div key={arg.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${arg.position === 'pro' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {arg.position === 'pro' ? 'Pro ✅' : 'Con ❌'}
                  </span>
                  <Link
                    to={`/arguments/${arg.id}`}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    🔍 Analyze
                  </Link>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{arg.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  {arg.clarity_score > 0 && <span>Clarity: {arg.clarity_score.toFixed(1)}</span>}
                  {arg.relevance_score > 0 && <span>Relevance: {arg.relevance_score.toFixed(1)}</span>}
                  {arg.persuasiveness > 0 && <span>Persuasiveness: {arg.persuasiveness.toFixed(1)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebateDetail;

