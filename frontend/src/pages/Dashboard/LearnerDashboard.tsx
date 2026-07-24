import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api/client';
import type { LearnerDashboard as LearnerDashboardData } from '../../types';

const LearnerDashboard: React.FC = () => {
  const [data, setData] = useState<LearnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .learner()
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
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Could not load dashboard data.</p>
      </div>
    );
  }

  const trendColor =
    data.performance_trend === 'improving'
      ? 'text-green-600'
      : data.performance_trend === 'declining'
      ? 'text-red-600'
      : 'text-yellow-600';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learner Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your debate and presentation performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">🎯</div>
          <div>
            <p className="text-2xl font-bold">{data.debate_count}</p>
            <p className="text-sm text-gray-500">Debates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">🎤</div>
          <div>
            <p className="text-2xl font-bold">{data.presentation_count}</p>
            <p className="text-sm text-gray-500">Presentations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className="text-2xl font-bold">{data.ai_debate_sessions}</p>
            <p className="text-sm text-gray-500">AI Debates</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
            data.performance_trend === 'improving' ? 'bg-green-100' : data.performance_trend === 'declining' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            📈
          </div>
          <div>
            <p className={`text-2xl font-bold capitalize ${trendColor}`}>{data.performance_trend}</p>
            <p className="text-sm text-gray-500">Trend</p>
          </div>
        </div>
      </div>

      {/* Average Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">Average Debate Score</h3>
          <p className="text-3xl font-bold text-brand-600">{data.avg_debate_score.toFixed(1)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(data.avg_debate_score * 10, 100)}%` }}
            />
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-2">Average Presentation Score</h3>
          <p className="text-3xl font-bold text-green-600">{data.avg_presentation_score.toFixed(1)}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(data.avg_presentation_score * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/debates/create" className="btn-primary text-center py-3">
          🎯 Start a Debate
        </Link>
        <Link to="/presentations/submit" className="btn-success text-center py-3">
          🎤 Submit Presentation
        </Link>
        <Link to="/ai-debate" className="btn-secondary text-center py-3">
          🤖 AI Debate Practice
        </Link>
      </div>

      {/* Recent Scores */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Debate Scores</h3>
          <Link to="/debates" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        {data.recent_scores.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No debate scores yet. Start your first debate!</p>
        ) : (
          <div className="space-y-3">
            {data.recent_scores.map((s) => (
              <div key={s.session_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">Session #{s.session_id}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{new Date(s.date).toLocaleDateString()}</span>
                  <span className="font-semibold text-brand-600">{s.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Presentations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Presentations</h3>
          <Link to="/presentations" className="text-sm text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        {data.recent_presentations.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No presentations yet. Submit your first one!</p>
        ) : (
          <div className="space-y-3">
            {data.recent_presentations.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{p.title}</span>
                <span className="font-semibold text-green-600">{p.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;

