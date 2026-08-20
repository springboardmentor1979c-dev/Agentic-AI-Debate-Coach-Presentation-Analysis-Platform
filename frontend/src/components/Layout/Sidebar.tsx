import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  desc: string;
  icon: string;
  tag?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { role } = useAuth();

  const learnerLinks: NavItem[] = [
    { to: '/dashboard/learner', label: 'Learner Dashboard', desc: 'Real-time performance analytics & score metrics', icon: '📊' },
    { to: '/debates', label: 'Debate Sessions', desc: 'Manage structured debate rounds & evaluations', icon: '🎯', tag: 'Core' },
    { to: '/ai-debate', label: 'AI Debate Sparring', desc: 'Practice interactive debate against AI in real-time', icon: '🤖', tag: 'Live' },
    { to: '/presentations', label: 'Speech & Presentations', desc: 'NLP pace, fillers, emotion & acoustic analysis', icon: '🎤' },
    { to: '/coaching/plan', label: 'AI Coaching Plan', desc: 'Personalized training regimen & milestone tracks', icon: '📋' },
    { to: '/coaching/skills', label: 'Skill Growth Tracking', desc: 'Multi-dimensional progress charts over time', icon: '📈' },
    { to: '/notifications', label: 'Notifications & Alerts', desc: 'Session alerts, reminders & evaluation updates', icon: '🔔' },
    { to: '/profile', label: 'Profile & Settings', desc: 'Coaching preferences, experience level & goals', icon: '👤' },
  ];

  const coachLinks: NavItem[] = [
    { to: '/dashboard/coach', label: 'Coach Dashboard', desc: 'Cohort tracking & aggregate student performance', icon: '📊' },
    { to: '/debates', label: 'Debate Sessions', desc: 'Review student debates, rubrics & scores', icon: '🎯' },
    { to: '/ai-debate', label: 'AI Debate Sparring', desc: 'Test and inspect AI argument simulation engine', icon: '🤖' },
    { to: '/coaching/plan', label: 'AI Coaching Plans', desc: 'Inspect AI-recommended training paths', icon: '📋' },
    { to: '/coaching/skills', label: 'Skill Analytics', desc: 'Cohort skill trajectories & radar analysis', icon: '📈' },
    { to: '/notifications', label: 'Notifications', desc: 'Real-time platform activity updates', icon: '🔔' },
    { to: '/profile', label: 'Coach Profile', desc: 'Coaching style, rubric domains & preferences', icon: '👤' },
  ];

  const adminLinks: NavItem[] = [
    { to: '/dashboard/admin', label: 'Admin Dashboard', desc: 'System-wide analytics, users, tokens & logs', icon: '📊', tag: 'System' },
    { to: '/debates', label: 'All Debate Sessions', desc: 'Inspect all platform debates & audit data', icon: '🎯' },
    { to: '/ai-debate', label: 'AI Sparring Studio', desc: 'Simulate and stress-test LLM agent behavior', icon: '🤖' },
    { to: '/notifications', label: 'System Alerts', desc: 'Platform notifications & security audits', icon: '🔔' },
    { to: '/profile', label: 'Admin Settings', desc: 'Account credentials & system configuration', icon: '👤' },
  ];

  let links = learnerLinks;
  if (role === 'coach' || role === 'educator') links = coachLinks;
  if (role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out shadow-lg md:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-brand-700 flex items-center justify-center text-xl shadow-sm text-white">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Debate Coach</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-mono">
                AI v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500">Presentation Analysis</p>
          </div>
        </div>

        {/* Feature Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Capabilities
          </div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border border-transparent'
                }`
              }
            >
              <span className="text-xl mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate leading-tight">
                    {link.label}
                  </span>
                  {link.tag && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-bold">
                      {link.tag}
                    </span>
                  )}
                </div>
                {/* Descriptive subtext for live presentations */}
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug group-hover:text-slate-500">
                  {link.desc}
                </p>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer / Multi-Agent Status */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/60">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[11px] text-slate-800">4-Agent Pipeline</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Speech → Argument → Fallacy → Rebuttal
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

