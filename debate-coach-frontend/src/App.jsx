import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DebateSessionsPage from './pages/DebateSessionsPage';
import AnalysisPage from './pages/AnalysisPage';
import SimulationPage from './pages/SimulationPage';
import PresentationPage from './pages/PresentationPage';
import CoachingPage from './pages/CoachingPage';
import ReportsPage from './pages/ReportsPage';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    ],
  },
  {
    label: 'Debate',
    items: [
      { key: 'sessions', icon: '💬', label: 'Debate Sessions' },
      { key: 'simulation', icon: '🤖', label: 'AI Simulation' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { key: 'analysis', icon: '🔬', label: 'Argument Analysis' },
      { key: 'presentation', icon: '🎤', label: 'Presentation' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { key: 'coaching', icon: '🎓', label: 'Coaching & Scores' },
      { key: 'reports', icon: '📊', label: 'Reports' },
    ],
  },
];

function Sidebar({ page, setPage, user, logout }) {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div>
          <div className="sidebar-logo-text">Debate Coach</div>
          <div className="sidebar-logo-sub">AI-Powered Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.key}
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" title="Logout" onClick={logout}>⏻</button>
        </div>
      </div>
    </aside>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading platform...</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  const pageMap = {
    dashboard: <DashboardPage />,
    sessions: <DebateSessionsPage />,
    simulation: <SimulationPage />,
    analysis: <AnalysisPage />,
    presentation: <PresentationPage />,
    coaching: <CoachingPage />,
    reports: <ReportsPage />,
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
      <main className="main-content">
        {pageMap[page] || <DashboardPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
