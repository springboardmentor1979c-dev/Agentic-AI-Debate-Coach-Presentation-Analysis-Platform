import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Coach':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Educator':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <nav className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            DEBATE COACH
          </span>
          <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-blue-400 bg-blue-900/20 rounded">
            AI Platform
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-2">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-purple-300" />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)} font-semibold`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-900/40 text-red-300 hover:text-red-100 transition duration-200 text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
