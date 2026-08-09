import React from 'react';
import { 
  LayoutDashboard, Swords, Target, Mic, BarChart3, 
  Lightbulb, ShieldCheck, FileSpreadsheet, Settings, Award
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentRole }) {
  const menuItems = [
    { id: 'dashboard', label: `${currentRole} Dashboard`, icon: LayoutDashboard },
    { id: 'simulator', label: 'AI Debate Simulator', icon: Swords, badge: 'Interactive' },
    { id: 'arguments', label: 'Argument & Fallacies', icon: Target },
    { id: 'presentation', label: 'Speech & Voice Lab', icon: Mic },
    { id: 'reports', label: 'Performance & Reports', icon: BarChart3 },
    { id: 'coaching', label: 'Coaching & Learning Path', icon: Lightbulb },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Category */}
        <div>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Main Navigation</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Feature Spotlight Card */}
        <div className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-200">Weighted Scoring</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            30% Arg Quality • 20% Evidence • 20% Logic • 15% Rebuttal • 15% Speech
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Version 2.4 Active</span>
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> API Connected
        </span>
      </div>
    </aside>
  );
}
