import { useEffect, useState } from 'react';
import { getLearnerDashboard, getCoachDashboard, getAdminDashboard } from '../api';
import { useAuth } from '../AuthContext';

function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.min(100, (value / max) * 100);
  const cls = value >= 7 ? 'score-high' : value >= 5 ? 'score-mid' : 'score-low';
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className={`score-bar-value ${cls}`}>{value?.toFixed(1)}</span>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function GradeChip({ grade }) {
  const colorMap = {
    'A+': '#10b981', A: '#10b981', 'A-': '#34d399',
    'B+': '#6366f1', B: '#6366f1', 'B-': '#818cf8',
    'C+': '#f59e0b', C: '#f59e0b', 'C-': '#fbbf24',
    D: '#ef4444', F: '#dc2626',
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px',
      borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
      background: `${colorMap[grade] || '#64748b'}22`,
      color: colorMap[grade] || '#64748b',
      border: `1px solid ${colorMap[grade] || '#64748b'}44`,
    }}>{grade || 'N/A'}</span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = user?.role === 'admin' ? getAdminDashboard
      : user?.role === 'coach' ? getCoachDashboard
      : getLearnerDashboard;

    fetch()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <span>Loading your dashboard...</span>
    </div>
  );

  if (error) return <div className="alert alert-error">⚠️ {error}</div>;

  // ── ADMIN VIEW ──
  if (user?.role === 'admin') {
    const ps = data?.platform_stats || {};
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">⚙️ Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide analytics and user management</p>
        </div>
        <div className="stat-grid">
          <StatCard icon="👥" value={ps.total_users || 0} label="Total Users" />
          <StatCard icon="📊" value={ps.total_scores_recorded || 0} label="Scores Recorded" />
          <StatCard icon="⭐" value={(ps.avg_platform_score || 0).toFixed(1) + '/10'} label="Platform Avg Score" color="var(--accent-primary)" />
          {Object.entries(ps.users_by_role || {}).map(([role, count]) => (
            <StatCard key={role} icon="🎭" value={count} label={`${role}s`} />
          ))}
        </div>
        <div className="card">
          <div className="card-title">🕐 Recent Users</div>
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {(data?.recent_users || []).map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── COACH VIEW ──
  if (user?.role === 'coach') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">🏆 Coach Dashboard</h1>
          <p className="page-subtitle">Monitor and support your students' progress</p>
        </div>
        <div className="stat-grid">
          <StatCard icon="🎓" value={data?.total_students || 0} label="Total Students" />
          <StatCard icon="⭐" value={(data?.platform_avg_score || 0).toFixed(1)} label="Platform Avg Score" color="var(--accent-primary)" />
        </div>
        <div className="card">
          <div className="card-title">📋 Student Overview</div>
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead><tr><th>#</th><th>Student</th><th>Avg Score</th><th>Level</th><th>Sessions</th></tr></thead>
              <tbody>
                {(data?.student_summaries || []).map((s, i) => (
                  <tr key={s.user_id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td>
                      <span className={s.debate_avg_score >= 7 ? 'score-high' : s.debate_avg_score >= 5 ? 'score-mid' : 'score-low'}
                        style={{ fontWeight: 700 }}>{s.debate_avg_score.toFixed(1)}/10</span>
                    </td>
                    <td><span className="badge badge-info">{s.performance_level}</span></td>
                    <td>{s.total_scores}</td>
                  </tr>
                ))}
                {!data?.student_summaries?.length && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── LEARNER VIEW ──
  const stats = data?.stats || {};
  const trend = data?.performance_trend || [];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">
              Welcome back, <span className="text-gradient">{data?.user?.name?.split(' ')[0] || 'Debater'}</span> 👋
            </h1>
            <p className="page-subtitle">Track your progress and continue improving</p>
          </div>
          {data?.has_coaching_report && (
            <span className="badge badge-success">✅ Coaching Report Ready</span>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="💬" value={stats.total_sessions || 0} label="Total Debate Sessions" />
        <StatCard icon="✅" value={stats.completed_sessions || 0} label="Completed Sessions" />
        <StatCard icon="🎯" value={(stats.avg_debate_score || 0).toFixed(1) + '/10'} label="Avg Debate Score" color="var(--accent-primary)" />
        <StatCard icon="🎤" value={(stats.avg_presentation_score || 0).toFixed(1) + '/10'} label="Avg Presentation Score" color="var(--accent-secondary)" />
        <StatCard icon="📊" value={stats.total_scores_recorded || 0} label="Scores Recorded" />
        <StatCard icon="🔔" value={data?.unread_notifications || 0} label="Unread Notifications" color="var(--accent-warning)" />
      </div>

      <div className="grid-2" style={{ gap: '1.25rem' }}>
        {/* Recent Sessions */}
        <div className="card">
          <div className="card-title">📅 Recent Debate Sessions</div>
          {(data?.recent_sessions || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              No sessions yet. Create your first debate session!
            </p>
          ) : (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(data?.recent_sessions || []).map(s => (
                <div key={s.id} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.topic}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.format} · {s.position}
                    </div>
                  </div>
                  <span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'active' ? 'badge-info' : 'badge-muted'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Scores */}
        <div className="card">
          <div className="card-title">📈 Recent Performance Scores</div>
          {(data?.recent_scores || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              No scores yet. Complete a debate to see your performance!
            </p>
          ) : (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(data?.recent_scores || []).map(s => (
                <div key={s.id} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {s.score_type} Assessment
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GradeChip grade={s.grade} />
                    <span style={{
                      fontWeight: 700,
                      color: s.weighted_total >= 7 ? 'var(--accent-success)' : s.weighted_total >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                    }}>{s.weighted_total?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Trend */}
      {trend.length > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="card-title">📉 Performance Trend</div>
          <div style={{
            display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
            height: 80, marginTop: '1rem', padding: '0 0.5rem',
          }}>
            {trend.slice(-12).map((t, i) => {
              const h = Math.max(8, (t.score / 10) * 72);
              const col = t.score >= 7 ? 'var(--accent-success)' : t.score >= 5 ? 'var(--accent-warning)' : 'var(--accent-danger)';
              return (
                <div key={i} title={`${t.type}: ${t.score}`} style={{
                  flex: 1, height: h, background: col,
                  borderRadius: '4px 4px 0 0', opacity: 0.8,
                  transition: 'height 0.5s ease', cursor: 'pointer',
                  minWidth: 16,
                }} />
              );
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Last {trend.length} assessments
          </div>
        </div>
      )}
    </div>
  );
}
