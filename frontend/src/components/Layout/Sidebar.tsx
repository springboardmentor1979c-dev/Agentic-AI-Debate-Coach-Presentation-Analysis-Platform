import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { role } = useAuth();

  const learnerLinks = [
    { to: '/dashboard/learner', label: 'Dashboard', icon: '📊' },
    { to: '/debates', label: 'Debates', icon: '🎯' },
    { to: '/ai-debate', label: 'AI Debate', icon: '🤖' },
    { to: '/presentations', label: 'Presentations', icon: '🎤' },
    { to: '/coaching/plan', label: 'Coaching Plan', icon: '📋' },
    { to: '/coaching/skills', label: 'Skill Tracking', icon: '📈' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const coachLinks = [
    { to: '/dashboard/coach', label: 'Dashboard', icon: '📊' },
    { to: '/debates', label: 'Debates', icon: '🎯' },
    { to: '/ai-debate', label: 'AI Debate', icon: '🤖' },
    { to: '/coaching/plan', label: 'Coaching Plan', icon: '📋' },
    { to: '/coaching/skills', label: 'Skill Tracking', icon: '📈' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const adminLinks = [
    { to: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { to: '/debates', label: 'Debates', icon: '🎯' },
    { to: '/ai-debate', label: 'AI Debate', icon: '🤖' },
    { to: '/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  let links = learnerLinks;
  if (role === 'coach' || role === 'educator') links = coachLinks;
  if (role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <span className="text-2xl">🎙️</span>
          <div>
            <h2 className="font-bold text-lg text-brand-700">Debate Coach</h2>
            <p className="text-xs text-gray-500">AI-Powered Platform</p>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

