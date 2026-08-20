import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between z-30 shadow-2xs">
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg bg-slate-100 border border-slate-200 focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Presentation Status & User Salutation */}
      <div className="flex-1 ml-2 sm:ml-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-700">
            Welcome back,{' '}
            <span className="font-bold text-indigo-600">
              {user?.name || 'Debater'}
            </span>
          </h3>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Multi-Agent Live
          </span>
        </div>
        <p className="text-[11px] text-slate-400 hidden sm:block">
          Interactive Argumentation & Speech Analysis Platform
        </p>
      </div>

      {/* Right Controls (Role Badge & Logout) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/90 rounded-xl border border-slate-200">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-brand-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs font-bold text-indigo-700 capitalize tracking-wide font-mono">
            {user?.role || 'learner'}
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign out of your active session"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;


