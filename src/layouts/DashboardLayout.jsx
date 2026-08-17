import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoMenu, IoClose, IoSunny, IoMoon, IoNotifications, IoLogOut, IoPeople,
  IoStatsChart, IoChatboxEllipses, IoMic, IoCalendar, IoWarning,
  IoGitMerge, IoArrowForward, IoCheckmarkCircle, IoSettings, IoPerson
} from 'react-icons/io5';

const DashboardLayout = ({ children }) => {
  const { user, role, changeRole, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    changeRole(newRole);
    setRoleSelectOpen(false);
    navigate(`/${newRole}/dashboard`);
  };

  const learnerMenu = [
    { name: 'Dashboard', path: '/learner/dashboard', icon: IoStatsChart },
    { name: 'AI Debate Coach', path: '/learner/debate-coach', icon: IoChatboxEllipses },
    { name: 'Presentation Analysis', path: '/learner/presentation', icon: IoMic },
    { name: 'Debate Sessions', path: '/learner/sessions', icon: IoCalendar },
    { name: 'Argument Analysis', path: '/learner/argument', icon: IoCheckmarkCircle },
    { name: 'Fallacy Detection', path: '/learner/fallacies', icon: IoWarning },
    { name: 'Counterarguments', path: '/learner/counterarguments', icon: IoGitMerge },
    { name: 'AI Coaching', path: '/learner/coaching', icon: IoArrowForward },
    { name: 'Reports', path: '/learner/reports', icon: IoStatsChart },
    { name: 'Notifications', path: '/learner/notifications', icon: IoNotifications },
    { name: 'Profile', path: '/learner/profile', icon: IoPerson },
    { name: 'Settings', path: '/learner/settings', icon: IoSettings },
  ];

  const getMenuForRole = () => {
    switch (role) {
      case 'coach':
        return [
          { name: 'Coach Dashboard', path: '/coach/dashboard', icon: IoStatsChart },
          { name: 'Profile', path: '/learner/profile', icon: IoPerson },
          { name: 'Settings', path: '/learner/settings', icon: IoSettings },
        ];
      case 'educator':
        return [
          { name: 'Educator Dashboard', path: '/educator/dashboard', icon: IoStatsChart },
          { name: 'Profile', path: '/learner/profile', icon: IoPerson },
          { name: 'Settings', path: '/learner/settings', icon: IoSettings },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', path: '/admin/dashboard', icon: IoStatsChart },
          { name: 'Profile', path: '/learner/profile', icon: IoPerson },
          { name: 'Settings', path: '/learner/settings', icon: IoSettings },
        ];
      default:
        return learnerMenu;
    }
  };

  const menuItems = getMenuForRole();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-darkbg-base dark:text-slate-100 flex relative overflow-hidden">
      
      {/* Floating particles background for premium theme */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-blue-500/10 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[30%] right-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[150px] animate-pulse-slow" />
      </div>

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200/50 dark:border-darkbg-border glass-panel dark:bg-darkbg-card/45 backdrop-blur-xl h-screen sticky top-0 z-20 flex-shrink-0">
        <div className="px-6 py-6 border-b border-slate-200/50 dark:border-darkbg-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            🧠
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 dark:from-blue-400 dark:to-brand-400">
              DebateIQ AI
            </h1>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-brand-500/80">
              {role} Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'text-slate-650 hover:bg-slate-100/80 dark:text-slate-350 dark:hover:bg-darkbg-accent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-brand-400 transition-colors'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-darkbg-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all"
          >
            <IoLogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 bg-white dark:bg-darkbg-card border-r border-slate-200 dark:border-darkbg-border flex flex-col h-full z-10 p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-darkbg-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    🧠
                  </div>
                  <div>
                    <h1 className="font-display font-extrabold text-lg text-slate-800 dark:text-white">DebateIQ AI</h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">{role}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-500 dark:text-slate-400"
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-6 space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-darkbg-accent hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 dark:border-darkbg-border pt-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  <IoLogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative scroll-smooth">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 glass-panel dark:bg-darkbg-base/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-darkbg-border flex-shrink-0">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            {/* Left Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-700 dark:text-slate-200"
              >
                <IoMenu className="h-5 w-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Console</span>
                <span className="text-slate-300 dark:text-darkbg-border">/</span>
                <span className="text-indigo-600 dark:text-brand-400 capitalize">{role}</span>
                <span className="text-slate-300 dark:text-darkbg-border">/</span>
                <span className="text-slate-800 dark:text-slate-200 capitalize">
                  {location.pathname.split('/').pop()?.replace('-', ' ')}
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setRoleSelectOpen(!roleSelectOpen)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300"
                >
                  <IoPeople className="h-4 w-4 text-indigo-500 dark:text-brand-400" />
                  Role: <span className="capitalize text-slate-900 dark:text-white font-bold">{role}</span>
                </button>
                <AnimatePresence>
                  {roleSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setRoleSelectOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel-deep dark:bg-darkbg-card border border-slate-200/50 dark:border-white/10 shadow-2xl p-2 z-20"
                      >
                        {['learner', 'coach', 'educator', 'admin'].map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(r)}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
                              role === r
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-brand-950 dark:text-brand-300'
                                : 'hover:bg-slate-50 dark:hover:bg-darkbg-accent text-slate-650 dark:text-slate-300'
                            }`}
                          >
                            {r === 'coach' ? 'Debate Coach' : r}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-700 dark:text-slate-200 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <IoSunny className="h-4.5 w-4.5 text-amber-400" /> : <IoMoon className="h-4.5 w-4.5 text-indigo-600" />}
              </button>

              {/* Notification Bell with Badge */}
              <Link
                to="/learner/notifications"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-700 dark:text-slate-200 transition-colors relative"
              >
                <IoNotifications className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-darkbg-base" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 dark:border-darkbg-border hover:opacity-90 transition-opacity"
                >
                  <img
                    src={user?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </button>
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel-deep dark:bg-darkbg-card border border-slate-200/50 dark:border-white/10 shadow-2xl p-2.5 z-20"
                      >
                        <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-darkbg-border mb-1.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Guest User'}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user?.email || 'guest@debateiq.ai'}</p>
                        </div>
                        <Link
                          to="/learner/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-darkbg-accent hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          <IoPerson className="h-4 w-4" />
                          View Profile
                        </Link>
                        <Link
                          to="/learner/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-darkbg-accent hover:text-slate-900 dark:hover:text-white transition-colors mb-1.5"
                        >
                          <IoSettings className="h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        >
                          <IoLogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
