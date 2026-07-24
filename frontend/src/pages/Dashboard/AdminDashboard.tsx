import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api/client';
import type { AdminDashboard as AdminDashboardData } from '../../types';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .admin()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Could not load admin dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide analytics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">👥</div>
          <div>
            <p className="text-2xl font-bold">{data.total_users}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="text-2xl font-bold">{data.active_users}</p>
            <p className="text-sm text-gray-500">Active Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">🎯</div>
          <div>
            <p className="text-2xl font-bold">{data.total_sessions}</p>
            <p className="text-sm text-gray-500">Debate Sessions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">🎤</div>
          <div>
            <p className="text-2xl font-bold">{data.total_presentations}</p>
            <p className="text-sm text-gray-500">Presentations</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className="text-2xl font-bold">{data.total_ai_debates}</p>
            <p className="text-sm text-gray-500">AI Debates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">⚡</div>
          <div>
            <p className="text-2xl font-bold">{data.ai_agent_runs}</p>
            <p className="text-sm text-gray-500">AI Agent Runs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl">🔤</div>
          <div>
            <p className="text-2xl font-bold">{data.total_tokens_used.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Tokens Used</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-xl">📝</div>
          <div>
            <p className="text-2xl font-bold">{data.audit_log_count}</p>
            <p className="text-sm text-gray-500">Audit Logs</p>
          </div>
        </div>
      </div>

      {/* Users by Role */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Users by Role</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(data.by_role).map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-brand-600">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

