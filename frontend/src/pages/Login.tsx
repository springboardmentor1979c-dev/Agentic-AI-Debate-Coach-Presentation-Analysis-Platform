import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemo = (role: string, email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🎙️</span>
          <h1 className="text-3xl font-bold text-white mt-3">Debate Coach AI</h1>
          <p className="text-indigo-200 mt-1">Sign in to your account</p>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <p className="text-xs text-indigo-200 mb-2 font-medium">QUICK LOGIN — DEMO ACCOUNTS:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Learner', email: 'learner@demo.com' },
              { label: 'Coach', email: 'coach@demo.com' },
              { label: 'Educator', email: 'educator@demo.com' },
              { label: 'Admin', email: 'admin@demo.com' },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => fillDemo(d.label.toLowerCase(), d.email)}
                type="button"
                className="text-xs bg-white/20 hover:bg-white/30 text-white rounded-lg py-2 px-3 transition-colors"
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-indigo-300 mt-2">Password: <code className="text-white">password123</code></p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

