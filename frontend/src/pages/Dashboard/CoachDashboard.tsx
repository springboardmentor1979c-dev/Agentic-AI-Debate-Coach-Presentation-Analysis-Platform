import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../api/client';
import type { CoachDashboard as CoachDashboardData } from '../../types';

const CoachDashboard: React.FC = () => {
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .coach()
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
    return <div className="text-center py-12 text-gray-500">Could not load coach dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coach Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor students and track platform performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">📋</div>
          <div>
            <p className="text-2xl font-bold">{data.sessions_created}</p>
            <p className="text-sm text-gray-500">Sessions Created</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">⭐</div>
          <div>
            <p className="text-2xl font-bold">{data.total_evaluations}</p>
            <p className="text-sm text-gray-500">Total Evaluations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">👥</div>
          <div>
            <p className="text-2xl font-bold">{data.students_tracked}</p>
            <p className="text-sm text-gray-500">Students Tracked</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">📊</div>
          <div>
            <p className="text-2xl font-bold">{data.avg_platform_score.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Platform Score</p>
          </div>
        </div>
      </div>

      {/* Student Summaries */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Student Summaries</h3>
        {data.student_summaries.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No student data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">User ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Sessions</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {data.student_summaries.map((s) => (
                  <tr key={s.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">#{s.user_id}</td>
                    <td className="py-3 px-2">{s.sessions}</td>
                    <td className="py-3 px-2 font-semibold">{s.avg_score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;

