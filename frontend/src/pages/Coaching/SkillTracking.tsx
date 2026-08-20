import React, { useEffect, useState } from 'react';
import { coachingAPI } from '../../api/client';
import type { SkillData } from '../../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SKILL_METADATA: Record<string, { label: string; desc: string; icon: string; color: string; border: string }> = {
  argumentation: {
    label: 'Argumentation',
    desc: 'Warrant construction, impact framing & claim robustness.',
    icon: '📝',
    color: 'rgba(99, 102, 241, 0.25)',
    border: 'rgb(99, 102, 241)',
  },
  delivery: {
    label: 'Speech Delivery',
    desc: 'Acoustic pacing (WPM), vocal presence & filler avoidance.',
    icon: '🎤',
    color: 'rgba(34, 197, 94, 0.25)',
    border: 'rgb(34, 197, 94)',
  },
  logic: {
    label: 'Formal Logic',
    desc: 'Deductive validity, premise consistency & fallacy immunity.',
    icon: '🧠',
    color: 'rgba(234, 179, 8, 0.25)',
    border: 'rgb(234, 179, 8)',
  },
  rebuttal: {
    label: 'Rebuttal Clash',
    desc: 'Refutation precision, turn-backs & defensive weighing.',
    icon: '🛡️',
    color: 'rgba(239, 68, 68, 0.25)',
    border: 'rgb(239, 68, 68)',
  },
  clarity: {
    label: 'Rhetorical Clarity',
    desc: 'Lexical structure, sentence conciseness & audience engagement.',
    icon: '✨',
    color: 'rgba(168, 85, 247, 0.25)',
    border: 'rgb(168, 85, 247)',
  },
};

const SkillTracking: React.FC = () => {
  const [data, setData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  useEffect(() => {
    coachingAPI
      .getSkills()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading Multi-Dimensional Skill Vectors...</p>
      </div>
    );
  }

  if (!data || data.total_records === 0) {
    return (
      <div className="card text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-3xl flex items-center justify-center mx-auto">
          📈
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No skill telemetry recorded yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Complete debates and speech presentations to generate multi-dimensional competency curves.
          </p>
        </div>
      </div>
    );
  }

  const skillNames = Object.keys(data.skills);
  const activeSkill = selectedSkill || skillNames[0] || 'argumentation';
  const activeData = data.skills[activeSkill] || [];
  const meta = SKILL_METADATA[activeSkill] || {
    label: activeSkill,
    desc: 'Skill competency curve',
    icon: '📊',
    color: 'rgba(99, 102, 241, 0.25)',
    border: 'rgb(99, 102, 241)',
  };

  const chartData = {
    labels: activeData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: meta.label,
        data: activeData.map((d) => d.score),
        borderColor: meta.border,
        backgroundColor: meta.color,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: meta.border,
        pointBorderColor: '#ffffff',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 2, color: '#64748b', font: { size: 10 } },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: '#f1f5f9' },
      },
    },
  };

  const avgScores = skillNames.map((name) => {
    const scores = data.skills[name];
    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    return { name, avg: Math.round(avg * 10) / 10 };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              📈 Multi-Dimensional Skill Growth Curves
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              5 Competency Vectors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking longitudinal progression across logic, delivery acoustics, claim argumentation, and refutations.
          </p>
        </div>
      </div>

      {/* Interactive 5-Skill Selectors */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
          Select Skill Dimension to Inspect
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {avgScores.map((s) => {
            const sm = SKILL_METADATA[s.name] || { label: s.name, icon: '📊', border: '#6366f1', desc: '' };
            const isActive = activeSkill === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setSelectedSkill(s.name)}
                className={`card p-3.5 text-left transition-all ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-sm'
                    : 'hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{sm.icon}</span>
                  <span className="text-base font-black font-mono" style={{ color: sm.border }}>
                    {s.avg.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 capitalize truncate">{sm.label}</p>
                <p className="desc-text text-[10px] mt-0.5 line-clamp-1">{sm.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Telemetry Chart */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{meta.icon}</span>
              <h3 className="font-bold text-sm text-slate-900">{meta.label} Progress Trajectory</h3>
            </div>
            <p className="desc-text mt-0.5">{meta.desc}</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
            Scale: 0.0 – 10.0
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          {activeData.length > 1 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Complete at least 2 sessions to render the progression trajectory curve.
            </div>
          )}
        </div>
      </div>

      {/* Historical Session Score Records */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Recent {meta.label} Evaluation Logs
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Last 5 Samples</span>
        </div>

        <div className="space-y-2">
          {activeData.slice(-5).reverse().map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <span className="text-slate-600 font-mono">
                📅 {new Date(r.date).toLocaleDateString()}
              </span>
              <span className="font-black font-mono text-sm px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs" style={{ color: meta.border }}>
                {r.score.toFixed(1)} / 10.0
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SkillTracking;


