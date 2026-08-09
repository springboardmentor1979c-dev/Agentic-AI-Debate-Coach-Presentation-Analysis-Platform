import React, { useState, useEffect } from 'react';
import { GraduationCap, Download, Trophy, BarChart3, Users, Award } from 'lucide-react';
import { api } from '../services/api';

export default function EducatorDashboard() {
  const [data, setData] = useState({
    class_name: "AP Rhetoric & Public Debate 2026",
    total_enrolled: 32,
    class_average_score: 81.6,
    format_performance: [
      { format: "Oxford", avg_score: 84.5 },
      { format: "Parliamentary", avg_score: 79.8 },
      { format: "Public Forum", avg_score: 82.1 },
      { format: "Policy", avg_score: 78.4 }
    ],
    top_performers: [
      { rank: 1, name: "Sophia Rodriguez", score: 92.1 },
      { rank: 2, name: "David Kim", score: 88.7 },
      { rank: 3, name: "Alex Chen", score: 86.4 }
    ]
  });

  useEffect(() => {
    api.getEducatorDashboard().then(setData).catch(() => {});
  }, []);

  const handleExportClick = () => {
    window.open(api.getExcelAnalyticsUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Institutional Educator Portal
          </div>
          <h2 className="text-xl font-extrabold text-white">{data.class_name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Aggregate class performance reports, format benchmarking, and rankings.</p>
        </div>

        <button 
          onClick={handleExportClick}
          className="gradient-btn px-5 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" /> Export Class Analytics (CSV / Excel)
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Format Performance */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Performance Across 4 Debate Formats
          </h3>
          <div className="space-y-4">
            {data.format_performance.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.format} Debate Format</span>
                  <span className="text-indigo-300 font-bold">{item.avg_score}% Avg</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                    style={{ width: `${item.avg_score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Student Rankings */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Class Leaderboard
          </h3>
          <div className="space-y-3">
            {data.top_performers.map((st) => (
              <div key={st.rank} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center ${
                    st.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    st.rank === 2 ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40' :
                    'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                  }`}>
                    #{st.rank}
                  </span>
                  <p className="text-xs font-bold text-slate-200">{st.name}</p>
                </div>
                <span className="text-xs font-extrabold text-emerald-400">{st.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
