import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <button
        className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={onMenuClick}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 ml-4">
        <h3 className="text-sm text-gray-500">
          Welcome back,{' '}
          <span className="font-semibold text-gray-800">{user?.name || 'User'}</span>
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
          {user?.role || 'learner'}
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

