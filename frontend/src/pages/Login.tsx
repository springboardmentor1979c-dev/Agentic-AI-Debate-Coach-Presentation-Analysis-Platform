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
  const fillDemo = (emailValue: string) => {
    setEmail(emailValue);
    setPassword('password123');
  };

  const demoRoles = [
    { label: 'Learner', email: 'learner@demo.com', desc: 'Debate sparring, speech analysis & coaching plan', icon: '🎓' },
    { label: 'Coach', email: 'coach@demo.com', desc: 'Cohort evaluation, rubrics & student tracking', icon: '👔' },
    { label: 'Educator', email: 'educator@demo.com', desc: 'Curriculum oversight & presentation feedback', icon: '📚' },
    { label: 'Admin', email: 'admin@demo.com', desc: 'System telemetry, agent audits & token metrics', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Column: Platform Feature Presentation */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Demo • Agentic AI Platform
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Debate Coach{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-brand-700 bg-clip-text text-transparent">
                AI Platform
              </span>
            </h1>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Real-time multi-agent debate simulation, automated fallacy detection, acoustic speech coaching, and personalized skill development.
            </p>
          </div>

          {/* Feature Highlights with descriptive explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:border-slate-300 transition-all">
              <div className="text-xl mb-1">🤖</div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">AI Debate Sparring</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Interactive turn-by-turn counterargument and rebuttal generation.</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:border-slate-300 transition-all">
              <div className="text-xl mb-1">🔍</div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fallacy Detection</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Semantic logical fallacy identification with repair guidance.</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:border-slate-300 transition-all">
              <div className="text-xl mb-1">🎤</div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Speech & Acoustics</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Pace (WPM), filler frequency, confidence, and emotion telemetry.</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:border-slate-300 transition-all">
              <div className="text-xl mb-1">📊</div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Rubrics</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Instant scoring with exportable PDF/Excel executive reports.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login Box & Demo Selector */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* 1-Click Demo Accounts Selector */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                <span>⚡</span> Quick Demo Access (1-Click Fill)
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Zero setup needed</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((d) => (
                <button
                  key={d.label}
                  onClick={() => fillDemo(d.email)}
                  type="button"
                  className="text-left bg-white hover:bg-indigo-50/50 border border-indigo-100 hover:border-indigo-300 p-2.5 rounded-xl transition-all duration-150 group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      {d.icon} {d.label}
                    </span>
                    <span className="text-[9px] text-indigo-600 font-bold uppercase font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Fill</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-1">
                    {d.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Login Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-500 mb-5">Enter your credentials or click any demo profile above.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., learner@demo.com"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Authorized demo email or registered address</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-sm"
                  placeholder="••••••••"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Default demo password: <code className="text-indigo-600 font-semibold">password123</code></p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-bold mt-2 shadow-sm">
                {loading ? 'Authenticating...' : 'Sign In & Launch Platform →'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Need a new user profile?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;


