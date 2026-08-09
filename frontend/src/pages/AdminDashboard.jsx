import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Server, Users, UserPlus, Trash2, Edit3, 
  Search, Sliders, RefreshCw, CheckCircle2, AlertTriangle, 
  Activity, Cpu, Eye, X, Plus, Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    platform_metrics: {
      total_users: 1240,
      active_debates_today: 84,
      total_presentations_analyzed: 156,
      llm_api_latency_ms: 142,
      speech_engine_accuracy: 98.4,
      system_uptime: 99.98,
      ai_engine_mode: "Hybrid (Rule-based NLP + LLM Prompts)",
      fallback_enabled: true
    },
    role_distribution: { Learners: 1050, "Debate Coaches": 120, Educators: 60, Administrators: 10 },
    system_status: [
      { service: "FastAPI Core API", status: "Operational", latency: "12ms" },
      { service: "Logical Fallacy Engine (8 Types)", status: "Operational", latency: "8ms" },
      { service: "Speech Prosody & WPM Engine", status: "Operational", latency: "35ms" },
      { service: "AI Debate Opponent Generator", status: "Operational", latency: "142ms" }
    ],
    logs: [
      { timestamp: "11:42:01", level: "INFO", service: "Core API", message: "Admin dashboard initialized." }
    ]
  });

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: "", email: "", username: "", password: "", role: "Learner" });

  // System Controls State
  const [engineMode, setEngineMode] = useState("Hybrid (Rule-based NLP + LLM Prompts)");
  const [latencyMs, setLatencyMs] = useState(142);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchMetrics();
    fetchUsers();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res);
      if (res.platform_metrics) {
        setEngineMode(res.platform_metrics.ai_engine_mode || "Hybrid");
        setLatencyMs(res.platform_metrics.llm_api_latency_ms || 142);
        setFallbackEnabled(res.platform_metrics.fallback_enabled ?? true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.getAdminUsers();
      setUsers(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createAdminUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ full_name: "", email: "", username: "", password: "", role: "Learner" });
      setMsg("User created successfully!");
      fetchUsers();
      fetchMetrics();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateAdminUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      setMsg(`Updated User #${userId} role to ${newRole}`);
      fetchMetrics();
    } catch (err) {
      setMsg(`Failed to update role: ${err.message}`);
    } finally {
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user from the platform?")) return;
    try {
      await api.deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMsg(`User #${userId} removed.`);
      fetchMetrics();
    } catch (err) {
      setMsg(`Failed to delete user: ${err.message}`);
    } finally {
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleSaveSystemConfig = async () => {
    setLoading(true);
    try {
      await api.updateSystemConfig({
        ai_engine_mode: engineMode,
        latency_simulation_ms: latencyMs,
        fallback_enabled: fallbackEnabled
      });
      setShowConfigModal(false);
      setMsg("System configuration updated!");
      fetchMetrics();
    } catch (err) {
      setMsg(`Config update failed: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  // Filtered User list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Health & Operations Control
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Dynamic Administrator Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">Manage user access roles, configure AI model engine parameters, and monitor system diagnostics in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <Sliders className="w-4 h-4 text-indigo-400" /> AI Engine Controls
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Add New Platform User
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-xs text-indigo-200 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {msg}
        </div>
      )}

      {/* Real-time KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400">Total Users</p>
          <p className="text-2xl font-extrabold text-white">{metrics.platform_metrics.total_users}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Active Accounts</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400">Active Debates Today</p>
          <p className="text-2xl font-extrabold text-indigo-400">{metrics.platform_metrics.active_debates_today}</p>
          <span className="text-[10px] text-indigo-300 font-semibold">Simulations Run</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400">LLM Latency</p>
          <p className="text-2xl font-extrabold text-purple-400">{metrics.platform_metrics.llm_api_latency_ms} ms</p>
          <span className="text-[10px] text-purple-300 font-semibold">Live Simulation</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400">Speech Accuracy</p>
          <p className="text-2xl font-extrabold text-emerald-400">{metrics.platform_metrics.speech_engine_accuracy}%</p>
          <span className="text-[10px] text-emerald-300 font-semibold">WPM & Filler Detection</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 md:col-span-1">
          <p className="text-[11px] font-semibold text-slate-400">Platform Uptime</p>
          <p className="text-2xl font-extrabold text-amber-400">{metrics.platform_metrics.system_uptime}%</p>
          <span className="text-[10px] text-amber-300 font-semibold">Operational</span>
        </div>
      </div>

      {/* Main Grid: User Management CRUD & Live Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roster CRUD Table (2 Cols) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Platform User Access & Role Management
            </h3>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Roles</option>
                <option value="Learner">Learners</option>
                <option value="Debate Coach">Coaches</option>
                <option value="Educator">Educators</option>
                <option value="Administrator">Admins</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">User Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role Persona</th>
                  <th className="py-3 px-3">Registered</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} 
                          alt="Avatar" 
                          className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" 
                        />
                        <span>{u.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{u.email}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Learner">Learner</option>
                        <option value="Debate Coach">Debate Coach</option>
                        <option value="Educator">Educator</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{u.created_at || "2026-08-01"}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        title="Remove User"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Log & Engine Status (1 Col) */}
        <div className="space-y-6">
          {/* Subsystem Health Status */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" /> AI Subsystem Diagnostics
            </h3>
            <div className="space-y-2">
              {metrics.system_status?.map((sys, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-slate-200">{sys.service}</span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300">{sys.latency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Logs Stream */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" /> Live System Event Feed
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {metrics.logs?.map((log, idx) => (
                <div key={idx} className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 text-[11px] font-mono space-y-0.5">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>[{log.timestamp}] {log.service}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.level === 'ALERT' ? 'bg-rose-500/20 text-rose-300' :
                      log.level === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {log.level}
                    </span>
                  </div>
                  <p className="text-slate-300">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Add New User Account
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g. David Kim"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="david.k@debatecoach.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="DavidKim"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Permission Persona</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Learner">Learner / Debater</option>
                  <option value="Debate Coach">Debate Coach</option>
                  <option value="Educator">Educator / Professor</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gradient-btn py-2.5 rounded-xl text-white font-bold shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" /> AI Engine Controls & Latency Simulator
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">AI Engine Processing Mode</label>
                <select
                  value={engineMode}
                  onChange={(e) => setEngineMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Hybrid (Rule-based NLP + LLM Prompts)">Hybrid (Rule-based NLP + LLM Prompts)</option>
                  <option value="LLM Agentic Reasoning Only">LLM Agentic Reasoning Only</option>
                  <option value="Deterministic NLP Engine Only">Deterministic NLP Engine Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Simulated LLM Latency (ms): {latencyMs} ms</label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={latencyMs}
                  onChange={(e) => setLatencyMs(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Zero-Key Fallback Engine</p>
                  <p className="text-[10px] text-slate-400">Allow offline deterministic rule execution when LLM API keys are unset.</p>
                </div>
                <input
                  type="checkbox"
                  checked={fallbackEnabled}
                  onChange={(e) => setFallbackEnabled(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSystemConfig}
                  disabled={loading}
                  className="flex-1 gradient-btn py-2.5 rounded-xl text-white font-bold shadow-lg"
                >
                  {loading ? 'Saving...' : 'Apply Config'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
