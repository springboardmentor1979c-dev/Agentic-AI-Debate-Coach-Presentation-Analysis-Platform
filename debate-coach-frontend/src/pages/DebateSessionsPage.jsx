import { useState, useEffect } from 'react';
import { createSession, getSessions, updateSessionStatus, submitArgument } from '../api';

const FORMATS = ['one_on_one', 'parliamentary', 'oxford', 'policy', 'public_forum', 'AI Debate Simulation'];
const ARG_TYPES = ['opening', 'rebuttal', 'closing'];

function ScoreDisplay({ analysis }) {
  if (!analysis) return null;
  const keys = ['clarity', 'relevance', 'evidence_strength', 'logical_consistency', 'persuasiveness'];
  return (
    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700 }}>Argument Analysis</span>
        <span style={{
          fontWeight: 800, fontSize: '1.25rem',
          color: analysis.overall >= 7 ? 'var(--accent-success)' : analysis.overall >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
        }}>{analysis.overall?.toFixed(1)}/10</span>
      </div>
      <div className="score-bar-container">
        {keys.map(k => (
          <div key={k} className="score-bar-row">
            <span className="score-bar-label" style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${(analysis[k] / 10) * 100}%` }} />
            </div>
            <span className="score-bar-value">{analysis[k]?.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        {analysis.feedback}
      </p>
      {analysis.suggestions?.length > 0 && (
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          {analysis.suggestions.map((s, i) => (
            <li key={i} style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginBottom: '0.25rem' }}>💡 {s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DebateSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedSession, setSelectedSession] = useState(null);
  const [error, setError] = useState('');

  // Create form
  const [form, setForm] = useState({ topic: '', format: 'one_on_one', position: 'for', notes: '' });
  const [creating, setCreating] = useState(false);

  // Argument form
  const [argContent, setArgContent] = useState('');
  const [argType, setArgType] = useState('opening');
  const [submitting, setSubmitting] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    getSessions().then(setSessions).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const s = await createSession(form);
      setSessions(prev => [s, ...prev]);
      setView('list');
      setForm({ topic: '', format: 'one_on_one', position: 'for', notes: '' });
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  };

  const handleSelectSession = async s => {
    setSelectedSession(s);
    setLastAnalysis(null);
    setView('detail');
  };

  const handleSubmitArg = async () => {
    if (!argContent.trim() || !selectedSession) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await submitArgument(selectedSession.id, argContent, argType);
      setLastAnalysis(result.analysis);
      setArgContent('');
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateSessionStatus(id, status);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      if (selectedSession?.id === id) setSelectedSession(prev => ({ ...prev, status }));
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><span>Loading sessions...</span></div>;

  // ── CREATE VIEW ──
  if (view === 'create') return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setView('list')}>← Back</button>
        <div>
          <h1 className="page-title">Create Debate Session</h1>
          <p className="page-subtitle">Set up a new debate topic and format</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Debate Topic *</label>
            <input className="form-input" placeholder="e.g. AI will replace human jobs in the next decade"
              value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Debate Format</label>
              <select className="form-input form-select" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                {FORMATS.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Your Position</label>
              <select className="form-input form-select" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="for">👍 For / Proposition</option>
                <option value="against">👎 Against / Opposition</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea className="form-textarea" placeholder="Session goals, context, or preparation notes..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '⏳ Creating...' : '✨ Create Session'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── DETAIL VIEW ──
  if (view === 'detail' && selectedSession) return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { setView('list'); setSelectedSession(null); }}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ fontSize: '1.25rem' }}>💬 {selectedSession.topic}</h1>
          <p className="page-subtitle">Format: {selectedSession.format} · Position: {selectedSession.position}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selectedSession.status === 'active' && (
            <button className="btn btn-secondary btn-sm" onClick={() => handleStatusUpdate(selectedSession.id, 'completed')}>
              ✅ Mark Complete
            </button>
          )}
          <span className={`badge ${selectedSession.status === 'completed' ? 'badge-success' : selectedSession.status === 'active' ? 'badge-info' : 'badge-muted'}`}>
            {selectedSession.status}
          </span>
        </div>
      </div>
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      <div className="card">
        <div className="card-title">📝 Submit Argument</div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Argument Type</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ARG_TYPES.map(t => (
              <button key={t} className={`btn btn-sm ${argType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setArgType(t)} style={{ textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Your Argument</label>
          <textarea className="form-textarea" rows={5}
            placeholder="Write your argument here. Be specific, use evidence, and maintain logical consistency..."
            value={argContent} onChange={e => setArgContent(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmitArg} disabled={submitting || !argContent.trim()}>
          {submitting ? '⏳ Analyzing...' : '🚀 Submit & Analyze'}
        </button>
        <ScoreDisplay analysis={lastAnalysis} />
      </div>
    </div>
  );

  // ── LIST VIEW ──
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">💬 Debate Sessions</h1>
          <p className="page-subtitle">Manage your debate practice sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('create')}>+ New Session</button>
      </div>
      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No debate sessions yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first debate session to start practicing</p>
          <button className="btn btn-primary" onClick={() => setView('create')}>+ Create First Session</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessions.map(s => (
            <div key={s.id} className="card" style={{ cursor: 'pointer', padding: '1.25rem' }}
              onClick={() => handleSelectSession(s)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>{s.topic}</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📋 {s.format.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🎯 {s.position}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'active' ? 'badge-info' : 'badge-muted'}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
