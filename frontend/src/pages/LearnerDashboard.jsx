import React, { useState, useEffect } from 'react';
import { 
  Trophy, Swords, Target, Mic, TrendingUp, Sparkles, 
  CheckCircle, ArrowUpRight, Award, Play
} from 'lucide-react';
import { api } from '../services/api';

export default function LearnerDashboard({ onNavigate }) {
  const [data, setData] = useState({
    stats: { total_debates: 18, win_rate: 77.8, avg_score: 82.4, presentations_analyzed: 12, fallacies_neutralized: 34 },
    recent_debates: [
      { id: 101, topic: "AI Ethics & Algorithmic Governance", format: "Oxford", score: 85.5, date: "2026-08-07" },
      { id: 102, topic: "Global Carbon Taxation Policy", format: "Parliamentary", score: 79.0, date: "2026-08-04" },
      { id: 103, topic: "Universal Basic Income Feasibility", format: "1v1 AI Simulation", score: 84.2, date: "2026-07-29" }
    ],
    skill_breakdown: {
      "Argument Quality": 84.0,
      "Evidence Usage": 80.0,
      "Logical Consistency": 85.0,
      "Rebuttal Effectiveness": 78.0,
      "Communication Skills": 83.0
    }
  });

  useEffect(() => {
    api.getLearnerDashboard().then(setData).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Tier: Proficient Debater (Top 12%)
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, Alex! Ready for your next Socratic debate?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Your logical consistency score rose by <span className="text-emerald-400 font-bold">+4.2%</span> this week. Practice 4-step rebuttals to break into the Master Debater tier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('simulator')}
            className="gradient-btn px-6 py-3 rounded-2xl font-bold text-xs text-white shadow-xl flex items-center gap-2"
          >
            <Swords className="w-4 h-4" /> Start AI Debate Simulation
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400">Total Debates</p>
          <p className="text-2xl font-extrabold text-white">{data.stats.total_debates}</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +3 this month
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400">Debate Win Rate</p>
          <p className="text-2xl font-extrabold text-indigo-400">{data.stats.win_rate}%</p>
          <span className="text-[10px] text-indigo-300 font-semibold">14 Wins / 4 Defeats</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400">Overall Score</p>
          <p className="text-2xl font-extrabold text-emerald-400">{data.stats.avg_score}%</p>
          <span className="text-[10px] text-slate-400">Weighted Average</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400">Presentations</p>
          <p className="text-2xl font-extrabold text-purple-400">{data.stats.presentations_analyzed}</p>
          <span className="text-[10px] text-purple-300 font-semibold">Avg 145 WPM</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2 col-span-2 md:col-span-1">
          <p className="text-[11px] font-semibold text-slate-400">Fallacies Avoided</p>
          <p className="text-2xl font-extrabold text-amber-400">{data.stats.fallacies_neutralized}</p>
          <span className="text-[10px] text-amber-300 font-semibold">Clean Logic</span>
        </div>
      </div>

      {/* Main Grid: Skill Breakdown & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Breakdown (30/20/20/15/15) */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Weighted Skill Breakdown (5 Factors)
            </h3>
            <span className="text-xs text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Official Formula
            </span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Argument Quality', weight: '30%', score: data.skill_breakdown['Argument Quality'], color: 'bg-indigo-500' },
              { label: 'Evidence Usage', weight: '20%', score: data.skill_breakdown['Evidence Usage'], color: 'bg-purple-500' },
              { label: 'Logical Consistency', weight: '20%', score: data.skill_breakdown['Logical Consistency'], color: 'bg-emerald-500' },
              { label: 'Rebuttal Effectiveness', weight: '15%', score: data.skill_breakdown['Rebuttal Effectiveness'], color: 'bg-amber-500' },
              { label: 'Communication Skills', weight: '15%', score: data.skill_breakdown['Communication Skills'], color: 'bg-pink-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.label} <span className="text-slate-500 font-normal">({item.weight})</span></span>
                  <span className="text-white font-extrabold">{item.score}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.color} transition-all duration-1000`} 
                    style={{ width: `${item.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Debates Side List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-100">Recent Debate History</h3>
          <div className="space-y-3">
            {data.recent_debates.map((item) => (
              <div key={item.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200 line-clamp-1">{item.topic}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">{item.format}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-400">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('reports')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            View Complete Performance Reports <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
