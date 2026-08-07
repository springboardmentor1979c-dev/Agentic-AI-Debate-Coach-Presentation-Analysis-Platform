import { useState } from 'react';
import { analyzePresentation, submitPresentationScore } from '../api';

export default function PresentationPage() {
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError('');
    setSaved(false);
    setResult(null);
    try {
      const res = await analyzePresentation(transcript, duration ? parseFloat(duration) : undefined);
      setResult(res);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await submitPresentationScore({
        confidence: result.confidence_score,
        clarity: result.clarity_score,
        engagement: result.engagement_score,
        delivery: result.confidence_score, // proxy
        content_quality: result.clarity_score,
      });
      setSaved(true);
    } catch (err) { setError(err.message); }
  };

  const PaceColor = p => p === 'ideal' ? 'var(--accent-success)' : p === 'slow' ? 'var(--accent-warning)' : 'var(--accent-danger)';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎤 Presentation Analyzer</h1>
        <p className="page-subtitle">Evaluate your speech for pace, clarity, confidence, and audience engagement</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Input */}
        <div className="card">
          <div className="card-title">📝 Presentation Transcript</div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Speech Duration (minutes, optional)</label>
            <input className="form-input" type="number" min="0.5" step="0.5"
              placeholder="e.g. 5 (leave blank to auto-estimate)"
              value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Paste Your Speech / Transcript *</label>
            <textarea className="form-textarea" rows={12}
              placeholder="Paste your presentation transcript here. This can be a speech text, recorded transcript, or prepared script..."
              value={transcript} onChange={e => setTranscript(e.target.value)} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'right' }}>
              {transcript.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <button className="btn btn-primary btn-full" onClick={handleAnalyze} disabled={loading || !transcript.trim()}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Analyzing Presentation...
              </span>
            ) : '🎤 Analyze Presentation'}
          </button>

          {/* Sample Text */}
          <button className="btn btn-ghost btn-sm btn-full" style={{ marginTop: '0.5rem' }}
            onClick={() => setTranscript(`Good morning everyone. Today I want to talk about the transformative power of artificial intelligence in modern education. AI, um, has the potential to, like, completely reshape how we learn and teach.

Basically, research shows that personalized learning powered by AI can improve student outcomes by up to 30 percent. According to studies from Stanford University, adaptive learning systems reduce the time to mastery by an average of 50 percent.

So, I think we should invest more in educational technology. The evidence is clear, the benefits are real, and the time to act is now. Are you ready to embrace the future of education? Thank you.`)}>
            📋 Load Sample Speech
          </button>
        </div>

        {/* Results */}
        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎤</div>
              <p style={{ color: 'var(--text-muted)' }}>Paste your transcript and click Analyze to get detailed feedback</p>
            </div>
          )}
          {loading && <div className="loading-screen"><div className="spinner" /><span>Evaluating your presentation...</span></div>}
          {result && (
            <>
              {/* Overall Score */}
              <div className="card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: '4rem', fontWeight: 900,
                  background: 'var(--gradient-hero)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '0.25rem',
                }}>
                  {result.overall_presentation_score?.toFixed(1)}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Overall Score / 10</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">~{result.estimated_duration_minutes?.toFixed(1)} min</span>
                  <span style={{ fontSize: '0.8rem' }}>
                    Pace:{' '}
                    <span style={{ fontWeight: 700, color: PaceColor(result.speech_pace) }}>
                      {result.speech_pace?.toUpperCase()}
                    </span>
                  </span>
                  <span className="badge badge-warning">
                    {result.filler_word_count} filler words ({result.filler_rate}%)
                  </span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-title">📊 Score Breakdown</div>
                <div className="score-bar-container" style={{ marginTop: '1rem' }}>
                  {[
                    { label: 'Confidence', value: result.confidence_score },
                    { label: 'Clarity', value: result.clarity_score },
                    { label: 'Engagement', value: result.engagement_score },
                  ].map(m => (
                    <div key={m.label} className="score-bar-row">
                      <span className="score-bar-label">{m.label}</span>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${(m.value / 10) * 100}%` }} />
                      </div>
                      <span className="score-bar-value">{m.value?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filler Words */}
              {result.filler_words_found?.length > 0 && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-title">⚠️ Filler Words Found</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {result.filler_words_found.map((fw, i) => (
                      <span key={i} className="badge badge-warning">"{fw}"</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.improvement_tips?.length > 0 && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="card-title">💡 Improvement Tips</div>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.improvement_tips.map((t, i) => (
                      <div key={i} style={{
                        padding: '0.625rem 0.875rem',
                        background: 'rgba(16,185,129,0.08)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        borderLeft: '3px solid var(--accent-success)',
                        color: 'var(--text-secondary)',
                      }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-title">📝 AI Coach Feedback</div>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                  {result.feedback}
                </p>
              </div>

              {/* Save */}
              {saved
                ? <div className="alert alert-success">✅ Score saved to your performance history!</div>
                : <button className="btn btn-secondary btn-full" onClick={handleSave}>💾 Save Score to History</button>
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}
