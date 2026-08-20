import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-slate-800">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-brand-700 items-center justify-center text-3xl shadow-sm text-white mb-3">
            🎙️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Your Account</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Get started with AI debate coaching & speech analysis</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., Jane Doe"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Displayed on leaderboard, debate records & reports</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm"
                placeholder="you@domain.com"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Used for unique identification & secure JWT tokens</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field text-sm"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters for security</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field text-sm"
              >
                <option value="learner">🎓 Learner — Practice debates, presentations & personal plan</option>
                <option value="coach">👔 Coach — Evaluate rounds, view student cohorts & analytics</option>
                <option value="educator">📚 Educator — Curriculum oversight & speech feedback</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Configures role-based access control (RBAC) & views</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-bold mt-2 shadow-sm">
              {loading ? 'Creating account...' : 'Complete Registration →'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


