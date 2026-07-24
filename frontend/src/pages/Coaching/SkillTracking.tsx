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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SKILL_COLORS: Record<string, { bg: string; border: string }> = {
  argumentation: { bg: 'rgba(99, 102, 241, 0.2)', border: 'rgb(99, 102, 241)' },
  delivery: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgb(34, 197, 94)' },
  logic: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgb(234, 179, 8)' },
  rebuttal: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgb(239, 68, 68)' },
  clarity: { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgb(168, 85, 247)' },
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!data || data.total_records === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-gray-500">No skill tracking data yet. Complete debates and presentations to build your skill profile.</p>
      </div>
    );
  }

  const skillNames = Object.keys(data.skills);
  const activeSkill = selectedSkill || skillNames[0];
  const activeData = data.skills[activeSkill] || [];

  const chartData = {
    labels: activeData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: activeSkill.charAt(0).toUpperCase() + activeSkill.slice(1),
        data: activeData.map((d) => d.score),
        borderColor: SKILL_COLORS[activeSkill]?.border || 'rgb(99, 102, 241)',
        backgroundColor: SKILL_COLORS[activeSkill]?.bg || 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${activeSkill.charAt(0).toUpperCase() + activeSkill.slice(1)} Progress`, font: { size: 14 } },
    },
    scales: {
      y: { min: 0, max: 10, ticks: { stepSize: 1 } },
    },
  };

  const avgScores = skillNames.map((name) => {
    const scores = data.skills[name];
    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    return { name, avg: Math.round(avg * 10) / 10 };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📈 Skill Tracking</h1>
        <p className="text-gray-500 mt-1">Monitor your skill development over time</p>
      </div>

      {/* Average Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {avgScores.map((s) => (
          <button
            key={s.name}
            onClick={() => setSelectedSkill(s.name)}
            className={`stat-card cursor-pointer transition-all ${
              activeSkill === s.name ? 'ring-2 ring-brand-500' : ''
            }`}
          >
            <div>
              <p className="text-xl font-bold" style={{ color: SKILL_COLORS[s.name]?.border }}>
                {s.avg.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 capitalize">{s.name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        {activeData.length > 1 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Need at least 2 data points for a chart. Keep practicing!</p>
          </div>
        )}
      </div>

      {/* Recent Records */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Records</h2>
        <div className="space-y-2">
          {activeData.slice(-5).reverse().map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString()}</span>
              <span className="font-semibold" style={{ color: SKILL_COLORS[activeSkill]?.border }}>
                {r.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillTracking;

