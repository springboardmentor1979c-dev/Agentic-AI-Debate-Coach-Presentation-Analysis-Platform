import React, { useState } from 'react';
import { User, ShieldAlert, Cpu, Activity, Clock, Server, BarChart2, BookOpen, GraduationCap, Trophy, ChevronRight, Award } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system', 'coach', 'educator'

  // Platform Metrics
  const stats = [
    { name: 'Active Users', value: '342', icon: User, change: '+12% this week', color: 'text-purple-400' },
    { name: 'Average API Latency', value: '240 ms', icon: Clock, change: 'Stable', color: 'text-blue-400' },
    { name: 'LLM Token Usage', value: '1.2M', icon: Cpu, change: '80% budget remaining', color: 'text-pink-400' },
    { name: 'Error Rate', value: '0.04%', icon: ShieldAlert, change: 'Very Low', color: 'text-emerald-400' }
  ];

  // Coach Section: Student Skill Gaps
  const studentProgress = [
    { name: 'Sarah Jenkins', grade: 'A-', focus: 'Fallacy Avoidance', gap: 'Circular Reasoning tendency', score: 88 },
    { name: 'Marcus Vance', grade: 'B+', focus: 'Evidence Integration', gap: 'Lacks quantitative references', score: 83 },
    { name: 'Eliza Thorne', grade: 'A', focus: 'Public Speaking Speed', gap: 'Stable (132 WPM average)', score: 94 },
    { name: 'David Cho', grade: 'C', focus: 'Logical Consistency', gap: 'Slippery Slope errors detected', score: 71 }
  ];

  // Educator Section: Cohort Class Performance
  const cohortMetrics = [
    { class: 'Varsity Debate Cohort A', size: 18, avgScore: 86.4, rank: '#1 Cohort' },
    { class: 'Intro to Argumentation B', size: 24, avgScore: 74.2, rank: '#3 Cohort' },
    { class: 'Public Rhetoric Seminar C', size: 15, avgScore: 81.0, rank: '#2 Cohort' }
  ];

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Management & Performance Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Unified control center for System Admins, Debate Coaches, and Classroom Educators.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'system' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Health
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'coach' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Coach Review
          </button>
          <button
            onClick={() => setActiveTab('educator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'educator' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Educator Analytics
          </button>
        </div>
      </div>

      {activeTab === 'system' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center justify-between relative overflow-hidden bg-gradient-to-br from-slate-900/40 to-slate-900/10">
                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{s.name}</span>
                    <h3 className="text-3xl font-extrabold text-white">{s.value}</h3>
                    <span className="text-[10px] text-slate-500 block">{s.change}</span>
                  </div>
                  <div className={`p-3 bg-slate-950/50 rounded-xl border border-white/5 ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance distribution (SVG Chart) */}
            <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                Overall Student Score Distribution
              </h3>
              
              <div className="h-56 bg-slate-950/40 border border-white/5 rounded-xl p-4 flex items-end justify-between relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[10px] text-slate-500">Distribution across 500+ debates</div>
                {/* SVG histogram */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <rect x="50" y="110" width="30" height="30" rx="3" fill="#8b5cf6" opacity="0.6" />
                  <rect x="110" y="80" width="30" height="60" rx="3" fill="#8b5cf6" opacity="0.7" />
                  <rect x="170" y="40" width="30" height="100" rx="3" fill="#8b5cf6" opacity="0.8" />
                  <rect x="230" y="20" width="30" height="120" rx="3" fill="#ec4899" opacity="0.9" />
                  <rect x="290" y="50" width="30" height="90" rx="3" fill="#3b82f6" opacity="0.8" />
                  <rect x="350" y="90" width="30" height="50" rx="3" fill="#3b82f6" opacity="0.7" />
                  <rect x="410" y="120" width="30" height="20" rx="3" fill="#3b82f6" opacity="0.6" />
                </svg>
                <div className="text-[9px] text-slate-500 flex w-full justify-between pt-44 px-4 z-10">
                  <span>0-40 (Weak)</span>
                  <span>40-60 (Avg)</span>
                  <span>60-80 (Good)</span>
                  <span>80-100 (Expert)</span>
                </div>
              </div>
            </div>

            {/* System usage metrics */}
            <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                System Performance Log
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                  <span className="font-semibold text-slate-400">Database Connection Pool</span>
                  <span className="text-emerald-400 font-bold">12 / 20 Active</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                  <span className="font-semibold text-slate-400">Storage Usage (S3 / Local)</span>
                  <span className="text-white font-bold">2.4 GB / 100 GB</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                  <span className="font-semibold text-slate-400">LLM Prompt Cache Efficiency</span>
                  <span className="text-blue-400 font-bold">42.8% Hit Rate</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Avg Token Processing Latency</span>
                  <span className="text-white font-bold">12 ms / token</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'coach' && (
        <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-bold">Debate Coach Dashboard</h3>
              <p className="text-xs text-slate-400">Review student progress tracking, recent logical fallacy logs, and student skill gaps.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Avg Score</th>
                  <th className="py-3 px-4">Focus Target</th>
                  <th className="py-3 px-4">Detected Skill Gap</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {studentProgress.map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-extrabold text-[10px]">
                        {s.name[0]}
                      </div>
                      {s.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 bg-purple-600/30 text-purple-200 border border-purple-500/20 rounded-md font-bold">
                        {s.score} ({s.grade})
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-200">{s.focus}</td>
                    <td className="py-4 px-4 text-pink-400 italic">{s.gap}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg border border-white/10 transition">
                        Recommend Exercise
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'educator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cohort list */}
          <div className="lg:col-span-2 glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2 border-b border-white/5 pb-3">
              <Award className="w-5 h-5 text-blue-400" />
              Classroom & Cohort Rankings
            </h3>
            
            <div className="space-y-4">
              {cohortMetrics.map((c, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-blue-500/20 transition">
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{c.rank}</span>
                    <h4 className="text-sm font-bold text-white">{c.class}</h4>
                    <p className="text-[10px] text-slate-500">{c.size} active debate students registered</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Class Average</span>
                    <p className="text-2xl font-extrabold text-white mt-0.5">{c.avgScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick recommendations */}
          <div className="lg:col-span-1 glass-panel p-6 border border-white/5 rounded-3xl space-y-4 bg-gradient-to-br from-slate-900/50 to-blue-950/10">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Educator Quick Links</h3>
            <div className="space-y-3 text-xs">
              <button className="w-full py-3 bg-slate-950 border border-white/10 hover:border-blue-500/30 rounded-xl text-left px-4 flex items-center justify-between group transition">
                <span>Generate Class Performance Report</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </button>
              <button className="w-full py-3 bg-slate-950 border border-white/10 hover:border-blue-500/30 rounded-xl text-left px-4 flex items-center justify-between group transition">
                <span>View Global Ranking Table</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </button>
              <button className="w-full py-3 bg-slate-950 border border-white/10 hover:border-blue-500/30 rounded-xl text-left px-4 flex items-center justify-between group transition">
                <span>Export Skill Matrix CSV</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
