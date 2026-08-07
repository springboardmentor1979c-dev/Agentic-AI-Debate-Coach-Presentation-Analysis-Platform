import { useState } from 'react';
import { login, register } from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage() {
  const { setUser } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.role);
        await login(form.email, form.password);
      }
      const { getMe } = await import('../api');
      const user = await getMe();
      setUser(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <h1 className="auth-title">
            <span className="text-gradient">Debate Coach</span>
          </h1>
          <p className="auth-subtitle">AI-Powered Debate & Presentation Platform</p>
        </div>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Sign In
          </button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="John Doe"
                value={form.name} onChange={handleChange} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" name="role" value={form.role} onChange={handleChange}>
                <option value="learner">🎓 Learner</option>
                <option value="coach">🏆 Debate Coach</option>
                <option value="educator">📚 Educator</option>
                <option value="admin">⚙️ Administrator</option>
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {tab === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              tab === 'login' ? '→ Sign In' : '✨ Create Account'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🔒 Secured with JWT · Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
}
