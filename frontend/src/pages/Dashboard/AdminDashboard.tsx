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
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Querying System Telemetry & Token Logs...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-400 text-sm">Could not load admin system dashboard.</p>
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
              ⚡ System Administration & Telemetry
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Platform Infrastructure
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global system resource utilization, active sessions, multi-agent pipeline executions, and token metrics.
          </p>
        </div>
      </div>

      {/* Core Resource Metrics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          Core Platform Volume
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
              👥
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.total_users}</p>
                <span className="text-[10px] text-blue-600 font-mono font-bold">Accounts</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Total Registered</p>
              <p className="desc-text mt-0.5">Learners, coaches & admins.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
              ✅
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.active_users}</p>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">Active</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Active Participants</p>
              <p className="desc-text mt-0.5">Current concurrent sessions.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.total_sessions}</p>
                <span className="text-[10px] text-purple-600 font-mono font-bold">Debates</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Structured Debates</p>
              <p className="desc-text mt-0.5">Total formal rounds logged.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎤
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.total_presentations}</p>
                <span className="text-[10px] text-amber-600 font-mono font-bold">Speeches</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Speech Presentations</p>
              <p className="desc-text mt-0.5">NLP & acoustic analyses.</p>
            </div>
          </div>

        </div>
      </div>

      {/* AI Telemetry & Infrastructure */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          Agentic AI Engine & Audit Logs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl flex-shrink-0">
              🤖
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-rose-700 font-mono">{data.total_ai_debates}</p>
                <span className="text-[10px] text-rose-600 font-mono font-bold">Sparring</span>
              </div>
              <p className="text-xs font-bold text-slate-700">AI Sparring Sessions</p>
              <p className="desc-text mt-0.5">Interactive LLM rounds.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
              ⚡
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-indigo-700 font-mono">{data.ai_agent_runs}</p>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">Executed</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Agent Invocations</p>
              <p className="desc-text mt-0.5">4-agent pipeline chain runs.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
              🔤
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-black text-orange-700 font-mono truncate">{data.total_tokens_used.toLocaleString()}</p>
                <span className="text-[10px] text-orange-600 font-mono font-bold">Tokens</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Token Consumption</p>
              <p className="desc-text mt-0.5">Mock & live LLM tokens.</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-2xl flex-shrink-0">
              📝
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-teal-700 font-mono">{data.audit_log_count}</p>
                <span className="text-[10px] text-teal-600 font-mono font-bold">Entries</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Security Audit Logs</p>
              <p className="desc-text mt-0.5">Immutable event trail.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Role Breakdown Distribution */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>👥</span> User Demographics by RBAC Role
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of authenticated active user roles across the platform.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(data.by_role).map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-3xl font-black text-indigo-600 font-mono">{count}</p>
              <p className="text-xs font-bold text-slate-800 capitalize mt-1">{role}</p>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                {((count / Math.max(data.total_users, 1)) * 100).toFixed(0)}% of platform
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;


