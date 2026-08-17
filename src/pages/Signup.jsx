import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { IoMail, IoLockClosed, IoLogoGoogle, IoPerson } from 'react-icons/io5';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      signup(name, email, password);
      setIsLoading(false);
      navigate('/role-selection');
    }, 1250);
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      signup('Alex Mercer', 'alex.mercer@gmail.com', 'google-auth');
      setIsLoading(false);
      navigate('/role-selection');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base flex relative overflow-hidden items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full grid md:grid-cols-2 glass-panel-deep dark:bg-darkbg-card/80 border border-slate-200/50 dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden min-h-[600px]">
        {/* Left Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                🧠
              </div>
              <span className="font-display font-extrabold text-base text-slate-800 dark:text-white">DebateIQ AI</span>
            </Link>
            <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
              Create an Account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Start analyzing speeches and mastering arguments today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Full Name</label>
              <div className="relative">
                <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/55 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Email Address</label>
              <div className="relative">
                <IoMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/55 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 uppercase mb-2">Password</label>
              <div className="relative">
                <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-850 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/55 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-3.5 mt-2 text-sm font-semibold"
            >
              Get Started Free
            </Button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <hr className="w-full border-slate-200 dark:border-darkbg-border" />
            <span className="absolute bg-slate-50 dark:bg-darkbg-card px-3 text-xs text-slate-400 uppercase font-bold tracking-wider">
              Or sign up with
            </span>
          </div>

          <Button
            onClick={handleGoogleSignup}
            variant="outline"
            icon={IoLogoGoogle}
            className="w-full py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Sign up with Google
          </Button>

          <p className="text-xs text-center text-slate-450 dark:text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-brand-400 hover:underline">
              Log In
            </Link>
          </p>
        </div>

        {/* Right Side: Graphic Panel */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 to-purple-950 text-white relative">
          <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80')" }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/50 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <span className="font-display font-extrabold tracking-wide">DebateIQ AI</span>
          </div>

          <div className="relative z-10 my-auto">
            <blockquote className="font-display font-bold text-xl md:text-2xl leading-relaxed mb-6">
              "Logic is the art of going wrong with confidence. DebateIQ is the countermeasure that anchors speech in evidence."
            </blockquote>
            <p className="text-xs font-semibold text-brand-300">— Logic & Rhetoric Department</p>
          </div>

          <div className="relative z-10 flex justify-between text-[10px] text-brand-400 uppercase tracking-widest font-bold border-t border-white/10 pt-6">
            <span>Evidence Extraction</span>
            <span>Refutation Training</span>
            <span>Clarity Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
