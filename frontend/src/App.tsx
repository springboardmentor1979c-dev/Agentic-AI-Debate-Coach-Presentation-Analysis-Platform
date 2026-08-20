import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import LearnerDashboard from './pages/Dashboard/LearnerDashboard';
import CoachDashboard from './pages/Dashboard/CoachDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import DebateList from './pages/Debates/DebateList';
import CreateDebate from './pages/Debates/CreateDebate';
import DebateDetail from './pages/Debates/DebateDetail';
import AIDebateChat from './pages/AIDebate/AIDebateChat';
import PresentationList from './pages/Presentations/PresentationList';
import SubmitPresentation from './pages/Presentations/SubmitPresentation';
import ArgumentDetail from './pages/Arguments/ArgumentDetail';
import CoachingPlanPage from './pages/Coaching/CoachingPlan';
import SkillTracking from './pages/Coaching/SkillTracking';
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

const App: React.FC = () => {
  const { token, role } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={token ? <Navigate to={getDefaultRoute(role)} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to={getDefaultRoute(role)} replace /> : <Register />}
      />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/learner" element={<LearnerDashboard />} />
        <Route path="/dashboard/coach" element={<CoachDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        <Route path="/debates" element={<DebateList />} />
        <Route path="/debates/create" element={<CreateDebate />} />
        <Route path="/debates/:id" element={<DebateDetail />} />

        <Route path="/ai-debate" element={<AIDebateChat />} />

        <Route path="/presentations" element={<PresentationList />} />
        <Route path="/presentations/submit" element={<SubmitPresentation />} />

        <Route path="/arguments/:id" element={<ArgumentDetail />} />

        <Route path="/coaching/plan" element={<CoachingPlanPage />} />
        <Route path="/coaching/skills" element={<SkillTracking />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={token ? getDefaultRoute(role) : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function getDefaultRoute(role: string | null): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'coach':
    case 'educator':
      return '/dashboard/coach';
    default:
      return '/dashboard/learner';
  }
}

export default App;

