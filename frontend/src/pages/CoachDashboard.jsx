import React, { useState, useEffect } from 'react';
import { Award, Users, CheckCircle2, AlertTriangle, ArrowUpRight, Search, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function CoachDashboard() {
  const [data, setData] = useState({
    active_students: 24,
    pending_reviews: 5,
    coaching_hours: 42.5,
    avg_student_growth: "+14.2%",
    students: [
      { id: 1, name: "Alex Chen", level: "Intermediate", avg_score: 84.2, weak_area: "Evidence Citations" },
      { id: 2, name: "Sophia Rodriguez", level: "Advanced", avg_score: 89.5, weak_area: "Filler Words (WPM)" },
      { id: 3, name: "Marcus Vance", level: "Beginner", avg_score: 71.0, weak_area: "Straw Man Fallacy" },
      { id: 4, name: "Emily Watson", level: "Intermediate", avg_score: 81.8, weak_area: "Rebuttal Timing" }
    ]
  });

  useEffect(() => {
    api.getCoachDashboard().then(setData).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Debate Coach Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage student progress, review AI argument evaluations, and assign targeted skill drills.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold">Active Coached Students</p>
            <p className="text-xl font-extrabold text-indigo-400">{data.active_students} Students</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold">Pending Review Queue</p>
          <p className="text-2xl font-extrabold text-amber-400">{data.pending_reviews}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold">Coaching Hours Logged</p>
          <p className="text-2xl font-extrabold text-indigo-400">{data.coaching_hours} hrs</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold">Avg Skill Growth Rate</p>
          <p className="text-2xl font-extrabold text-emerald-400">{data.avg_student_growth}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-semibold">Top Evaluated Format</p>
          <p className="text-2xl font-extrabold text-purple-400">Oxford Debate</p>
        </div>
      </div>

      {/* Student List Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Assigned Student Roster & Skill Gap Analysis
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search student..." 
              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Experience Level</th>
                <th className="py-3 px-4">Avg Debate Score</th>
                <th className="py-3 px-4">Primary Skill Gap</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3 px-4 font-bold text-slate-200">{st.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 text-[10px] font-semibold border border-slate-700">
                      {st.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-emerald-400">{st.avg_score}%</td>
                  <td className="py-3 px-4 text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> {st.weak_area}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-all">
                      Review Debate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
