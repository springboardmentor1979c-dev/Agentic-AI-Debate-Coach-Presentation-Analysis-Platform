import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import LearnerDashboard from './pages/LearnerDashboard';
import CoachDashboard from './pages/CoachDashboard';
import EducatorDashboard from './pages/EducatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DebateSimulator from './pages/DebateSimulator';
import ArgumentStudio from './pages/ArgumentStudio';
import PresentationLab from './pages/PresentationLab';
import ReportsAndCoaching from './pages/ReportsAndCoaching';
import { getAuthToken, getCurrentRole, setCurrentRole, removeAuthToken } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentRole, setRole] = useState(getCurrentRole());
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setUser({
        id: 1,
        email: "alex.chen@debatecoach.ai",
        username: "AlexChen",
        full_name: "Alex Chen",
        role: currentRole,
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexChen"
      });
    }
  }, [currentRole]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setCurrentRole(newRole);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (!user && !getAuthToken()) {
    return <AuthPage onLoginSuccess={(u) => { setUser(u); setRole(u.role || 'Learner'); }} />;
  }

  // Render role-appropriate dashboard when activeTab is 'dashboard'
  const renderDashboard = () => {
    switch (currentRole) {
      case 'Debate Coach':
        return <CoachDashboard />;
      case 'Educator':
        return <EducatorDashboard />;
      case 'Administrator':
        return <AdminDashboard />;
      case 'Learner':
      default:
        return <LearnerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'simulator':
        return <DebateSimulator />;
      case 'arguments':
        return <ArgumentStudio />;
      case 'presentation':
        return <PresentationLab />;
      case 'reports':
        return <ReportsAndCoaching />;
      case 'coaching':
        return <ReportsAndCoaching />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentRole={currentRole}
        setRole={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRole={currentRole}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
