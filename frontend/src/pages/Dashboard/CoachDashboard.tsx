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
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading Coach Cohort Performance Analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-400 text-sm">Could not load coach dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              👔 Coach & Educator Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Cohort Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor student cohorts, inspect debate rubrics, and track platform-wide pedagogical scoring trends.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-slate-900">{data.sessions_created}</p>
              <span className="text-[10px] text-blue-600 font-mono font-bold">Sessions</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Created Rounds</p>
            <p className="desc-text mt-0.5">Debates organized by coach.</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
            ⭐
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-slate-900">{data.total_evaluations}</p>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">Completed</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Total Evaluations</p>
            <p className="desc-text mt-0.5">Scored debate speeches.</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
            👥
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-slate-900">{data.students_tracked}</p>
              <span className="text-[10px] text-purple-600 font-mono font-bold">Enrolled</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Students Tracked</p>
            <p className="desc-text mt-0.5">Active debaters in cohort.</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-amber-700">{data.avg_platform_score.toFixed(1)}</p>
              <span className="text-[10px] text-amber-600 font-mono font-bold">/ 10.0</span>
            </div>
            <p className="text-xs font-bold text-slate-700">Platform Mean Score</p>
            <p className="desc-text mt-0.5">Cohort composite performance.</p>
          </div>
        </div>

      </div>

      {/* Student Cohort Summaries Table */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>👥</span> Student Performance Cohort Table
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregate debate round volume and average performance score per student.
            </p>
          </div>
        </div>

        {data.student_summaries.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">No student performance records logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="text-left py-3 px-3">Student Identifier</th>
                  <th className="text-left py-3 px-3">Completed Sessions</th>
                  <th className="text-left py-3 px-3">Mean Performance Score</th>
                  <th className="text-right py-3 px-3">Status Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.student_summaries.map((s) => (
                  <tr key={s.user_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      User #{s.user_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {s.sessions} sessions
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                      {s.avg_score.toFixed(2)} / 10.0
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.avg_score >= 7.5
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.avg_score >= 5.0
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {s.avg_score >= 7.5 ? 'Distinguished' : s.avg_score >= 5.0 ? 'Proficient' : 'Needs Coaching'}
                      </span>
                    </td>
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


