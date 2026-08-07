import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllRead } from '../api';
import { getMyReport } from '../api';

function NotifIcon({ type }) {
  const map = { success: '✅', info: 'ℹ️', warning: '⚠️', achievement: '🏆', error: '❌' };
  return <span>{map[type] || '🔔'}</span>;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReportsPage() {
  const [tab, setTab] = useState('report');
  const [report, setReport] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab === 'report') loadReport();
    if (tab === 'notifications') loadNotifs();
  }, [tab]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try { setReport(await getMyReport()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const loadNotifs = async () => {
    setLoading(true);
    try { setNotifs(await getNotifications()); }
    catch {}
    finally { setLoading(false); }
  };

  const handleRead = async id => {
    await markNotificationRead(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
  };

  const handleReadAll = async () => {
    await markAllRead();
    setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Reports & Notifications</h1>
        <p className="page-subtitle">Track your performance and stay informed</p>
      </div>

      <div className="tabs">
        {[
          { key: 'report', label: '📈 Performance Report' },
          { key: 'notifications', label: '🔔 Notifications' },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
            {t.key === 'notifications' && notifs.filter(n => !n.is_read).length > 0 && (
              <span style={{
                marginLeft: '0.5rem', background: 'var(--accent-danger)',
                borderRadius: '99px', padding: '1px 6px', fontSize: '0.7rem',
              }}>
                {notifs.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {loading && <div className="loading-screen"><div className="spinner" /></div>}

      {/* ── REPORT TAB ── */}
      {tab === 'report' && report && !loading && (
        <div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-value">{report.summary?.total_debate_sessions || 0}</div>
              <div className="stat-label">Debate Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
                {(report.summary?.avg_debate_score || 0).toFixed(1)}/10
              </div>
              <div className="stat-label">Avg Debate Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎤</div>
              <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>
                {(report.summary?.avg_presentation_score || 0).toFixed(1)}/10
              </div>
              <div className="stat-label">Avg Presentation Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{report.summary?.best_grade || 'N/A'}</div>
              <div className="stat-label">Best Grade</div>
            </div>
          </div>

          {/* Score History Table */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title">📋 Score History</div>
            {report.score_history?.length > 0 ? (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Level</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.score_history.map(s => (
                      <tr key={s.id}>
                        <td style={{ textTransform: 'capitalize' }}>{s.score_type}</td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: s.weighted_total >= 7 ? 'var(--accent-success)'
                              : s.weighted_total >= 5 ? 'var(--accent-warning)'
                              : 'var(--accent-danger)',
                          }}>
                            {s.weighted_total?.toFixed(1)}/10
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem',
                            fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                          }}>{s.grade}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.performance_level}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                No scores recorded yet.
              </p>
            )}
          </div>

          {/* Sessions Table */}
          <div className="card">
            <div className="card-title">📅 Session History</div>
            {report.sessions?.length > 0 ? (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table>
                  <thead><tr><th>Topic</th><th>Format</th><th>Position</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {report.sessions.slice(0, 10).map(s => (
                      <tr key={s.id}>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.topic}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {s.format.replace(/_/g, ' ')}
                        </td>
                        <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{s.position}</td>
                        <td>
                          <span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'active' ? 'badge-info' : 'badge-muted'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>No sessions yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === 'notifications' && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {notifs.filter(n => !n.is_read).length} unread · {notifs.length} total
            </span>
            {notifs.some(n => !n.is_read) && (
              <button className="btn btn-ghost btn-sm" onClick={handleReadAll}>✅ Mark All Read</button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔔</div>
              <p style={{ color: 'var(--text-muted)' }}>No notifications yet. Complete a debate session to get started!</p>
            </div>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
                onClick={() => !n.is_read && handleRead(n.id)}>
                <div style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 2 }}>
                  <NotifIcon type={n.notif_type} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-msg">{n.message}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span className="notification-time">{timeAgo(n.created_at)}</span>
                  {!n.is_read && <div className="notification-dot" />}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
