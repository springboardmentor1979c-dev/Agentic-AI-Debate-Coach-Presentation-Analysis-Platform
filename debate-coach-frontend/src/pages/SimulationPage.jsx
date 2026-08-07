import { useState, useRef, useEffect } from 'react';
import { startSimulation, respondToSimulation, endSimulation } from '../api';

const FORMATS = [
  { value: 'one_on_one', label: '1-on-1 Debate' },
  { value: 'parliamentary', label: 'Parliamentary' },
  { value: 'oxford', label: 'Oxford Style' },
  { value: 'policy', label: 'Policy Debate' },
  { value: 'public_forum', label: 'Public Forum' },
];

function QualityBadge({ q }) {
  const map = { strong: 'badge-success', moderate: 'badge-warning', weak: 'badge-danger' };
  return q ? <span className={`badge ${map[q] || 'badge-muted'}`} style={{ fontSize: '0.65rem' }}>{q}</span> : null;
}

export default function SimulationPage() {
  const [stage, setStage] = useState('setup'); // 'setup' | 'debate' | 'ended'
  const [config, setConfig] = useState({
    topic: '',
    human_position: 'for',
    ai_position: 'against',
    debate_format: 'one_on_one',
    opening_argument: '',
  });
  const [session, setSession] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.turns]);

  const handleStart = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const s = await startSimulation(config);
      setSession(s);
      setStage('debate');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRespond = async () => {
    if (!input.trim() || !session) return;
    setLoading(true);
    setError('');
    const text = input;
    setInput('');
    try {
      const s = await respondToSimulation(session.session_id, text);
      setSession(s);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleEnd = async () => {
    setLoading(true);
    try {
      const s = await endSimulation(session.session_id);
      setSession(s);
      setStage('ended');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRespond(); }
  };

  // ── SETUP ──
  if (stage === 'setup') return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🤖 AI Debate Simulation</h1>
        <p className="page-subtitle">Practice against an AI opponent in a dynamic multi-turn debate</p>
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
          <form onSubmit={handleStart}>
            <div className="form-group">
              <label className="form-label">Debate Topic *</label>
              <input className="form-input" placeholder="e.g. Universal Basic Income should be implemented globally"
                value={config.topic} onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Your Position</label>
                <select className="form-input form-select" value={config.human_position}
                  onChange={e => setConfig(c => ({ ...c, human_position: e.target.value, ai_position: e.target.value === 'for' ? 'against' : 'for' }))}>
                  <option value="for">👍 For / Proposition</option>
                  <option value="against">👎 Against / Opposition</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Debate Format</label>
                <select className="form-input form-select" value={config.debate_format}
                  onChange={e => setConfig(c => ({ ...c, debate_format: e.target.value }))}>
                  {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Opening Argument (Optional)</label>
              <textarea className="form-textarea" rows={4}
                placeholder="Start strong! Enter your opening argument to kick off the debate..."
                value={config.opening_argument}
                onChange={e => setConfig(c => ({ ...c, opening_argument: e.target.value }))} />
            </div>
            <div style={{
              padding: '0.875rem', background: 'rgba(99,102,241,0.08)',
              borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)',
              marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)',
            }}>
              🤖 <strong>AI Position:</strong> The AI will argue <strong>{config.ai_position}</strong> the topic using dynamic, context-aware responses.
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Starting...' : '⚡ Start Debate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // ── ENDED ──
  if (stage === 'ended') return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏁 Debate Complete!</h1>
        <p className="page-subtitle">{session?.topic}</p>
      </div>
      {session?.final_coaching && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
          🎓 {session.final_coaching}
        </div>
      )}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">📜 Debate Transcript</div>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 400, overflowY: 'auto', padding: '0 0.25rem' }}>
          {session?.turns?.map((t, i) => (
            <div key={i} style={{
              padding: '0.875rem 1rem',
              background: t.speaker === 'human' ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${t.speaker === 'human' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {t.speaker === 'human' ? '👤 You' : '🤖 AI Opponent'} — Turn {t.turn_number}
                </span>
                <QualityBadge q={t.argument_quality} />
              </div>
              <p style={{ fontSize: '0.875rem' }}>{t.content}</p>
              {t.coaching_note && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-warning)', fontStyle: 'italic' }}>
                  {t.coaching_note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => { setStage('setup'); setSession(null); setConfig({ topic: '', human_position: 'for', ai_position: 'against', debate_format: 'one_on_one', opening_argument: '' }); }}>
        🔄 Start New Debate
      </button>
    </div>
  );

  // ── DEBATE ──
  const humanTurns = session?.turns?.filter(t => t.speaker === 'human') || [];
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>⚡ Live Debate</h1>
            <p className="page-subtitle">{session?.topic}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-info">Your position: {session?.human_position}</span>
            <span className="badge badge-warning">{humanTurns.length} turns</span>
            <button className="btn btn-danger btn-sm" onClick={handleEnd} disabled={loading}>🏁 End Debate</button>
          </div>
        </div>
      </div>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="chat-container">
        <div className="chat-messages">
          {(!session?.turns || session.turns.length === 0) && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
              🤖 The AI is ready to debate. Send your first argument!
            </div>
          )}
          {session?.turns?.map((turn, i) => (
            <div key={i} className={`chat-bubble ${turn.speaker}`}>
              <div className="chat-speaker" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{turn.speaker === 'human' ? '👤 You' : '🤖 AI Opponent'}</span>
                <QualityBadge q={turn.argument_quality} />
              </div>
              <p>{turn.content}</p>
              {turn.coaching_note && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-warning)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  {turn.coaching_note}
                </p>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai">
              <div className="chat-speaker">🤖 AI Opponent</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent-secondary)',
                    animation: `pulse 1s ease ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <textarea className="chat-input" rows={2}
            placeholder="Type your argument... (Enter to send, Shift+Enter for new line)"
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            disabled={loading} />
          <button className="btn btn-primary" onClick={handleRespond} disabled={loading || !input.trim()}>
            {loading ? '⏳' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
