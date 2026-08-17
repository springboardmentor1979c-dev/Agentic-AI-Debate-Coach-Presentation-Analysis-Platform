import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import RoleSelection from './pages/RoleSelection';
import NewDebate from "./pages/learner/NewDebate";
// Learner pages
import LearnerDashboard from './pages/learner/LearnerDashboard';
import AIDebateCoach from './pages/learner/AIDebateCoach';
import DebateSessions from './pages/learner/DebateSessions';
import PresentationAnalysis from './pages/learner/PresentationAnalysis';
import ArgumentAnalysis from './pages/learner/ArgumentAnalysis';
import FallacyDetection from './pages/learner/FallacyDetection';
import CounterargumentGenerator from './pages/learner/CounterargumentGenerator';
import AICoaching from './pages/learner/AICoaching';
import LearnerReports from './pages/learner/LearnerReports';
import LearnerNotifications from './pages/learner/LearnerNotifications';
import LearnerProfile from './pages/learner/LearnerProfile';
import LearnerSettings from './pages/learner/LearnerSettings';
import DebateRoom from "./pages/learner/DebateRoom";
// Other Role pages
import CoachDashboard from './pages/coach/CoachDashboard';
import EducatorDashboard from './pages/educator/EducatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Errors
import NotFound from './pages/errors/NotFound';
import ServerError from './pages/errors/ServerError';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Mock Protected Route Wrapper
const ProtectedRoute = ({ element: Component }) => {
  const { isAuthenticated } = useAuth();
  
  // For demo/prototype testing we allow access even if not authenticated, 
  // but if you want strict protection:
  // return isAuthenticated ? <DashboardLayout><Component /></DashboardLayout> : <Navigate to="/login" />;
  
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Onboarding */}
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* Learner Dashboard Routes */}
      <Route path="/learner/dashboard" element={<ProtectedRoute element={LearnerDashboard} />} />
      <Route path="/learner/debate-coach" element={<ProtectedRoute element={AIDebateCoach} />} />
      <Route path="/learner/presentation" element={<ProtectedRoute element={PresentationAnalysis} />} />
      <Route path="/learner/sessions" element={<ProtectedRoute element={DebateSessions} />} />
      <Route path="/learner/argument" element={<ProtectedRoute element={ArgumentAnalysis} />} />
      <Route path="/learner/fallacies" element={<ProtectedRoute element={FallacyDetection} />} />
      <Route path="/learner/counterarguments" element={<ProtectedRoute element={CounterargumentGenerator} />} />
      <Route path="/learner/coaching" element={<ProtectedRoute element={AICoaching} />} />
      <Route path="/learner/reports" element={<ProtectedRoute element={LearnerReports} />} />
      <Route path="/learner/notifications" element={<ProtectedRoute element={LearnerNotifications} />} />
      <Route path="/learner/profile" element={<ProtectedRoute element={LearnerProfile} />} />
      <Route path="/learner/settings" element={<ProtectedRoute element={LearnerSettings} />} />

      {/* Coach Dashboard Routes */}
      <Route path="/coach/dashboard" element={<ProtectedRoute element={CoachDashboard} />} />

      {/* Educator Dashboard Routes */}
      <Route path="/educator/dashboard" element={<ProtectedRoute element={EducatorDashboard} />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute element={AdminDashboard} />} />
      <Route
    path="/learner/new-debate"
    element={<NewDebate />}
/>
<Route
    path="/learner/debate-room"
    element={<DebateRoom />}
/>

      {/* Error Routes */}
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
