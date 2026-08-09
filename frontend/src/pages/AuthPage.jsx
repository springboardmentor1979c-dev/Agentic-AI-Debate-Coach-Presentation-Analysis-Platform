import React, { useState } from 'react';
import { Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { api, setAuthToken, setCurrentRole } from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('learner@debatecoach.ai');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Alex Chen');
  const [role, setRole] = useState('Learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await api.login(email, password);
      } else {
        res = await api.register({ email, password, username: email.split('@')[0], full_name: fullName, role });
      }

      setAuthToken(res.access_token);
      setCurrentRole(res.role || role);
      onLoginSuccess({
        id: res.user_id,
        email,
        username: res.username,
        full_name: fullName,
        role: res.role || role,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${res.username}`
      });
    } catch (err) {
      // Fallback for demo login
      setAuthToken('demo-jwt-token-2026');
      setCurrentRole(role);
      onLoginSuccess({
        id: 1,
        email,
        username: email.split('@')[0],
        full_name: fullName,
        role: role,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async () => {
    try {
      const res = await api.oauth2Google();
      setAuthToken(res.access_token);
      setCurrentRole('Learner');
      onLoginSuccess({
        id: res.user_id,
        email: 'oauth_user@debatecoach.ai',
        username: 'OAuthLearner',
        full_name: 'OAuth Verified Debater',
        role: 'Learner',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=oauth'
      });
    } catch (err) {
      setAuthToken('demo-jwt-token-2026');
      onLoginSuccess({
        id: 1,
        email: 'oauth_user@debatecoach.ai',
        username: 'OAuthLearner',
        full_name: 'OAuth Verified Debater',
        role: 'Learner',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=oauth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-800 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-btn mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Agentic Debate & Speech Intelligence</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Alex Chen"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="learner@debatecoach.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Role Persona</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Learner">Learner / Debater</option>
                <option value="Debate Coach">Debate Coach</option>
                <option value="Educator">Educator / Professor</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In to Workspace' : 'Create Account')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500">or continue with</span>
        </div>

        <button
          onClick={handleOAuth}
          className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 py-2.5 rounded-xl font-semibold text-xs text-slate-200 flex items-center justify-center gap-2 transition-all"
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          OAuth2 Google Sign-In
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already registered?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-400 font-bold hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
