import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import CreateDebate from '../pages/CreateDebate';
import MyDebates from '../pages/MyDebates';
import DebateArena from '../pages/DebateArena';
import ArgumentAnalysis from '../pages/ArgumentAnalysis';
import PresentationAnalysis from '../pages/PresentationAnalysis';
import PerformanceDashboard from '../pages/PerformanceDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import DashboardLayout from '../layouts/DashboardLayout';

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          
          <Route 
            path="/login" 
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            } 
          />

          {/* Authenticated Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-debate" element={<CreateDebate />} />
            <Route path="/my-debates" element={<MyDebates />} />
            
            {/* Week 2, 3 & 4 Milestones Pages */}
            <Route path="/debate/arena" element={<DebateArena />} />
            <Route path="/argument-analysis" element={<ArgumentAnalysis />} />
            <Route path="/presentation-analysis" element={<PresentationAnalysis />} />
            <Route path="/performance" element={<PerformanceDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
