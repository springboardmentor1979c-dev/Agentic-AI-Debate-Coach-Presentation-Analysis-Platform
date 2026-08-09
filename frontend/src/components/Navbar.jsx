import React, { useState } from 'react';
import { 
  Sparkles, Bell, Shield, User, ChevronDown, CheckCircle2, 
  BookOpen, Users, BarChart2, Award, LogOut
} from 'lucide-react';

export default function Navbar({ currentRole, setRole, activeTab, setActiveTab, user, onLogout }) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const roles = [
    { id: 'Learner', title: 'Learner / Debater', desc: 'Debate practice & speech labs', icon: BookOpen },
    { id: 'Debate Coach', title: 'Debate Coach', desc: 'Student progress & evaluations', icon: Award },
    { id: 'Educator', title: 'Educator / Professor', desc: 'Class analytics & rankings', icon: Users },
    { id: 'Administrator', title: 'Administrator', desc: 'Platform health & AI monitoring', icon: Shield }
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
            ARGUMENTA <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">AI COACH</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Debate & Speech Intelligence Platform</p>
        </div>
      </div>

      {/* Center Nav Badges */}
      <div className="hidden md:flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {currentRole} Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'simulator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Debate Simulator
        </button>
        <button 
          onClick={() => setActiveTab('arguments')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'arguments' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Argument & Fallacies
        </button>
        <button 
          onClick={() => setActiveTab('presentation')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'presentation' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Speech Lab
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Role:</span>
            <span className="font-semibold text-indigo-300">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl p-2 z-50 border border-slate-700 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Switch Persona / View</p>
              </div>
              <div className="py-1">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = currentRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs transition-all ${
                        isActive ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40' : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{r.title}</p>
                        <p className="text-[10px] text-slate-400">{r.desc}</p>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 relative border border-slate-700 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900" />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl p-4 z-50 border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-200">Alerts & Reminders</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">3 New</span>
              </div>
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-900/50">
                  <p className="text-xs font-semibold text-indigo-200">Upcoming Oxford Debate</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Session on 'AI Ethics' in 30 mins.</p>
                </div>
                <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-200">Coach Feedback Ready</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Speech analysis review complete.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img 
            src={user?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=Alex"} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border border-indigo-500/50 bg-slate-800"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-200">{user?.full_name || "Alex Chen"}</p>
            <p className="text-[10px] text-slate-400 font-medium">{currentRole}</p>
          </div>
          <button onClick={onLogout} title="Logout" className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
