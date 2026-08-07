import { useState, useEffect } from 'react';
import { getCoaching, autoCoaching, getScoreHistory, submitDebateScore } from '../api';

function PriorityBadge({ p }) {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
  return <span className={`badge ${map[p] || 'badge-muted'}`}>{p}</span>;
}

export default function CoachingPage() {
  const [tab, setTab] = useState('coaching');
  const [coaching, setCoaching] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Scoring form
  const [scores, setScores] = useState({
    argument_quality: 5, evidence_usage: 5, logical_consistency: 5,
    rebuttal_effectiveness: 5, communication_skills: 5,
  });
  const [scoreResult, setScoreResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scoringLoading, setScoringLoading] = useState(false);

  useEffect(() => {
    if (tab === 'coaching') loadCoaching();
    if (tab === 'scoring') loadHistory();
  }, [tab]);

  const loadCoaching = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await getCoaching();
      setCoaching(r);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const loadHistory = async () => {
    try {
      const h = await getScoreHistory();
      setHistory(h);
    } catch {}
  };

  const handleAutoCoach = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await autoCoaching();
      setCoaching(r);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmitScore = async () => {
    setScoringLoading(true);
    setError('');
    try {
      const res = await submitDebateScore(scores);
      setScoreResult(res);
      await loadHistory();
    } catch (err) { setError(err.message); }
    finally { setScoringLoading(false); }
  };

  const SliderRow = ({ key: k, label }) => (
    <div key={k} style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{
          fontWeight: 700,
          color: scores[k] >= 7 ? 'var(--accent-success)' : scores[k] >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
        }}>
          {scores[k]}/10
        </span>
      </div>
      <input type="range" min={0} max={10} step={0.5} value={scores[k]}
        onChange={e => setScores(s => ({ ...s, [k]: parseFloat(e.target.value) }))}
        style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
    </div>
  );

  const tabs = [
    { key: 'coaching', label: '🎓 Coaching Report' },
    { key: 'scoring', label: '📊 Score Debate' },
    { key: 'path', label: '🗺️ Learning Path' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎓 Coaching & Scoring</h1>
        <p className="page-subtitle">Personalized recommendations, performance scoring, and your learning journey</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* ── COACHING TAB ── */}
      {tab === 'coaching' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleAutoCoach} disabled={loading}>
              🔄 Refresh from Scores
            </button>
          </div>
          {loading && <div className="loading-screen"><div className="spinner" /><span>Loading coaching report...</span></div>}
          {coaching && !loading && (
            <>
              {/* Motivational Banner */}
              <div className="card" style={{
                marginBottom: '1.25rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                borderColor: 'rgba(99,102,241,0.4)',
                textAlign: 'center', padding: '1.75rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</div>
                <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>{coaching.motivational_message}</p>
              </div>

              <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-title">💪 Your Strengths</div>
                  {coaching.strengths?.length > 0 ? (
                    coaching.strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--accent-success)' }}>✅</span>
                        <span style={{ fontSize: '0.875rem' }}>{s}</span>
                      </div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete more debates to identify strengths.</p>}
                </div>
                <div className="card">
                  <div className="card-title">🎯 Skill Gaps</div>
                  {coaching.skill_gaps?.length > 0 ? (
                    coaching.skill_gaps.map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--accent-warning)' }}>⚡</span>
                        <span style={{ fontSize: '0.875rem' }}>{g}</span>
                      </div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No critical skill gaps identified!</p>}
                </div>
              </div>

              {/* Recommendations */}
              <div className="section-title">📋 Personalized Recommendations</div>
              {coaching.recommendations?.map((rec, i) => (
                <div key={i} className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span className="badge badge-muted" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{rec.category}</span>
                      <div className="card-title">{rec.title}</div>
                    </div>
                    <PriorityBadge p={rec.priority} />
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{rec.description}</p>
                  <div className="section-title" style={{ marginBottom: '0.5rem', fontSize: '0.75rem' }}>🏋️ Exercises</div>
                  {rec.exercises?.map((ex, j) => (
                    <div key={j} style={{
                      padding: '0.5rem 0.75rem', marginBottom: '0.4rem',
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    }}>
                      <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>→</span> {ex}
                    </div>
                  ))}
                  <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-success)', fontStyle: 'italic' }}>
                    📈 {rec.estimated_improvement}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── SCORING TAB ── */}
      {tab === 'scoring' && (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          <div className="card">
            <div className="card-title">📊 Submit Debate Score</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.75rem 0 1.25rem' }}>
              Rate your performance in each area using the sliders below
            </p>
            {[
              { k: 'argument_quality', label: '🧠 Argument Quality (30%)' },
              { k: 'evidence_usage', label: '📚 Evidence Usage (20%)' },
              { k: 'logical_consistency', label: '🔗 Logical Consistency (20%)' },
              { k: 'rebuttal_effectiveness', label: '🔄 Rebuttal Effectiveness (15%)' },
              { k: 'communication_skills', label: '🎤 Communication Skills (15%)' },
            ].map(({ k, label }) => (
              <div key={k} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
                  <span style={{
                    fontWeight: 700, minWidth: 40, textAlign: 'right',
                    color: scores[k] >= 7 ? 'var(--accent-success)' : scores[k] >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                  }}>{scores[k]}/10</span>
                </div>
                <input type="range" min={0} max={10} step={0.5} value={scores[k]}
                  onChange={e => setScores(s => ({ ...s, [k]: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
              </div>
            ))}
            <button className="btn btn-primary btn-full" onClick={handleSubmitScore} disabled={scoringLoading}>
              {scoringLoading ? '⏳ Calculating...' : '🚀 Submit Score'}
            </button>
          </div>

          <div>
            {scoreResult && (
              <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{scoreResult.badge}</div>
                <div style={{
                  fontSize: '3rem', fontWeight: 900,
                  background: 'var(--gradient-hero)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {scoreResult.weighted_total?.toFixed(1)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Weighted Score / 10</div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">Grade: {scoreResult.grade}</span>
                  <span className="badge badge-success">{scoreResult.performance_level}</span>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {scoreResult.coaching_summary}
                </p>
              </div>
            )}

            {/* Score History */}
            <div className="card">
              <div className="card-title">📈 Score History</div>
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>No scores yet. Submit your first score!</p>
              ) : (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {history.slice(0, 8).map(h => (
                    <div key={h.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.625rem', background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{h.score_type}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-info">{h.grade}</span>
                        <span style={{
                          fontWeight: 700,
                          color: h.weighted_total >= 7 ? 'var(--accent-success)' : h.weighted_total >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                        }}>{h.weighted_total?.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNING PATH TAB ── */}
      {tab === 'path' && (
        <div>
          {loading && <div className="loading-screen"><div className="spinner" /></div>}
          {coaching?.learning_path ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {coaching.learning_path.map((week, i) => (
                <div key={i} className="card" style={{ borderLeft: `4px solid var(--accent-primary)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--gradient-hero)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      W{week.week}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{week.focus}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Week {week.week} Focus Area</div>
                    </div>
                  </div>
                  <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>🎯 GOALS</div>
                      {week.goals?.map((g, j) => <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>✓ {g}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '0.4rem' }}>🏋️ EXERCISES</div>
                      {week.exercises?.map((e, j) => <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>→ {e}</div>)}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(6,182,212,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', color: 'var(--text-secondary)',
                    borderLeft: '3px solid var(--accent-tertiary)',
                  }}>
                    📋 <strong>Assessment:</strong> {week.assessment}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading your learning path...</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={loadCoaching}>Load Path</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
