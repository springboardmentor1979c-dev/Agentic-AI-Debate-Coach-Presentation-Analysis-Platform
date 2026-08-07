import { useState } from 'react';
import { analyzeArgument, detectFallacies, generateCounterarguments } from '../api';

function ScoreBar({ label, value }) {
  return (
    <div className="score-bar-row">
      <span className="score-bar-label" style={{ textTransform: 'capitalize' }}>{label.replace(/_/g, ' ')}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="score-bar-value">{value?.toFixed(1)}</span>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
  return <span className={`badge ${map[severity] || 'badge-muted'}`}>{severity}</span>;
}

export default function AnalysisPage() {
  const [tab, setTab] = useState('argument');
  const [topic, setTopic] = useState('');
  const [argument, setArgument] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlers = {
    argument: () => analyzeArgument(argument, topic || 'General Debate'),
    fallacy: () => detectFallacies(argument),
    counter: () => generateCounterarguments(argument, topic || 'General Debate'),
  };

  const handleAnalyze = async () => {
    if (!argument.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await handlers[tab]();
      setResult(res);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key: 'argument', label: '🧠 Argument Analysis' },
    { key: 'fallacy', label: '⚠️ Fallacy Detection' },
    { key: 'counter', label: '🔄 Counterarguments' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔬 Argument Analysis Engine</h1>
        <p className="page-subtitle">Evaluate arguments, detect fallacies, and generate rebuttals</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setResult(null); setError(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Input Panel */}
        <div className="card">
          <div className="card-title">📝 Input</div>
          {(tab === 'argument' || tab === 'counter') && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Debate Topic (Optional)</label>
              <input className="form-input" placeholder="e.g. Climate Change Policy"
                value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">
              {tab === 'argument' ? 'Argument to Analyze' : tab === 'fallacy' ? 'Text to Check for Fallacies' : 'Argument to Counter'}
            </label>
            <textarea className="form-textarea" rows={8}
              placeholder={
                tab === 'fallacy'
                  ? "Paste any text here — speeches, essays, social media posts, or debate transcripts..."
                  : "Write your argument clearly. Include claims, evidence, and reasoning..."
              }
              value={argument} onChange={e => setArgument(e.target.value)} />
          </div>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <button className="btn btn-primary btn-full" onClick={handleAnalyze}
            disabled={loading || !argument.trim()}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing...
              </span>
            ) : (
              tab === 'argument' ? '🧠 Analyze Argument'
                : tab === 'fallacy' ? '⚠️ Detect Fallacies'
                : '🔄 Generate Counterarguments'
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {tab === 'argument' ? '🧠' : tab === 'fallacy' ? '⚠️' : '🔄'}
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                {tab === 'argument' ? 'Your analysis results will appear here'
                  : tab === 'fallacy' ? 'Detected fallacies will be highlighted here'
                  : 'Generated counterarguments will appear here'}
              </p>
            </div>
          )}
          {loading && <div className="loading-screen"><div className="spinner" /><span>AI is analyzing...</span></div>}

          {/* ── Argument Analysis Results ── */}
          {result && tab === 'argument' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div className="card-title">📊 Analysis Results</div>
                <div style={{
                  fontSize: '2rem', fontWeight: 800,
                  color: result.overall >= 7 ? 'var(--accent-success)' : result.overall >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                }}>
                  {result.overall?.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/10</span>
                </div>
              </div>
              <div className="score-bar-container">
                {['clarity', 'relevance', 'evidence_strength', 'logical_consistency', 'persuasiveness'].map(k => (
                  <ScoreBar key={k} label={k} value={result[k]} />
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {result.feedback}
              </div>
              {result.suggestions?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div className="section-title" style={{ marginBottom: '0.5rem' }}>💡 Suggestions</div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{
                      padding: '0.5rem 0.75rem', marginBottom: '0.5rem',
                      background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem', color: 'var(--accent-success)',
                      borderLeft: '3px solid var(--accent-success)',
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Fallacy Detection Results ── */}
          {result && tab === 'fallacy' && (
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card-title">🔍 Fallacy Report</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: result.fallacy_count > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                      {result.fallacy_count}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fallacies Found</div>
                  </div>
                </div>
                <div style={{ margin: '0.75rem 0', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  {result.overall_assessment}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Credibility Score</span>
                  <span style={{
                    fontWeight: 700,
                    color: result.credibility_score >= 8 ? 'var(--accent-success)' : result.credibility_score >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                  }}>
                    {result.credibility_score?.toFixed(1)}/10
                  </span>
                </div>
              </div>
              {result.detected_fallacies?.length > 0 ? (
                result.detected_fallacies.map((f, i) => (
                  <div key={i} className="fallacy-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div className="fallacy-name">⚠️ {f.fallacy_type}</div>
                      <SeverityBadge severity={f.severity} />
                    </div>
                    {f.matched_text && <div className="fallacy-match">"{f.matched_text}"</div>}
                    <p className="fallacy-explanation">{f.explanation}</p>
                    <p className="fallacy-suggestion">✅ Fix: {f.correction_suggestion}</p>
                  </div>
                ))
              ) : (
                <div className="alert alert-success">✅ No logical fallacies detected! Your argument appears logically sound.</div>
              )}
            </div>
          )}

          {/* ── Counterargument Results ── */}
          {result && tab === 'counter' && (
            <div>
              {result.counterarguments?.map((c, i) => (
                <div key={i} className="card" style={{ marginBottom: '0.75rem' }}>
                  <div className="card-title" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--accent-primary)' }}>#{i + 1}</span> {c.counter_type}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{c.rebuttal}</p>
                  {c.supporting_points?.length > 0 && (
                    <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                      {c.supporting_points.map((p, j) => (
                        <li key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {p}</li>
                      ))}
                    </ul>
                  )}
                  <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(6,182,212,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-tertiary)', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-tertiary)', fontWeight: 600 }}>❓ Challenge: </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.challenge_question}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    💡 Strategy: {c.debate_strategy}
                  </div>
                </div>
              ))}
              {result.best_counter_type && (
                <div className="alert alert-info">
                  ⭐ <strong>Best approach:</strong> {result.best_counter_type} — {result.overall_strategy}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
