import Card from '../../components/Card';
import Button from '../../components/Button';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  IoAnalytics,
  IoMic,
  IoChatbubbles,
  IoFlame,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoCalendar,
  IoArrowForward,
  IoBook,
  IoSparkles,
  IoPerson,
} from "react-icons/io5";

const LearnerDashboard = () => {
const [dashboard, setDashboard] = useState(null);

const [loading, setLoading] = useState(true);
const trendData = dashboard?.trendData || [];
const skillData = dashboard?.skillData || [];
const recentActivity = dashboard?.recentActivity || [];
const exercises = dashboard?.exercises || [];

useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/dashboard/learner", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDashboard(response.data);

  } catch (error) {
    console.error("Dashboard Error:", error);
  } finally {
    setLoading(false);
  }
};

const stats = (dashboard?.stats || []).map((stat, index) => {
  const icons = [
    IoChatbubbles,
    IoMic,
    IoCalendar,
    IoTrendingUp,
    IoFlame,
    IoSparkles,
  ];

  const colors = [
    "text-blue-500",
    "text-purple-500",
    "text-pink-500",
    "text-emerald-500",
    "text-amber-500",
    "text-violet-500",
  ];

  const bgs = [
    "bg-blue-50 dark:bg-blue-950/20",
    "bg-purple-50 dark:bg-purple-950/20",
    "bg-pink-50 dark:bg-pink-950/20",
    "bg-emerald-50 dark:bg-emerald-950/20",
    "bg-amber-50 dark:bg-amber-950/20",
    "bg-violet-50 dark:bg-violet-950/20",
  ];

  return {
    ...stat,
    icon: icons[index],
    color: colors[index],
    bg: bgs[index],
    desc: stat.description,
  };
});
if (loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      Loading Dashboard...
    </div>
  );
}
  return (
    <div className="space-y-8">
      {/* Welcome Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Hello, {dashboard?.user?.full_name || "Learner"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your next debate match with the AI starts in <span className="font-bold text-indigo-600 dark:text-brand-400">2 hours</span>. Keep your streak alive!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Download PDF Summary</Button>
          <Button variant="primary" size="sm" icon={IoSparkles}>New AI Sparring</Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverEffect={true} variant="glass" className="p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-450 uppercase">{stat.name}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-black font-display text-slate-900 dark:text-white">{stat.value}</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-semibold truncate">{stat.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Trend Area Chart */}
        <Card variant="glass" className="lg:col-span-2 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
                Performance Score Trend
              </h3>
              <p className="text-xs text-slate-450">Weekly progress over the last 5 milestones</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-500"><span className="h-2 w-2 rounded-full bg-blue-500" /> Debate</span>
              <span className="flex items-center gap-1.5 text-purple-500"><span className="h-2 w-2 rounded-full bg-purple-500" /> Presentation</span>
            </div>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDebate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPresentation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="debate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDebate)" />
                <Area type="monotone" dataKey="presentation" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPresentation)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Radar Chart */}
        <Card variant="glass" className="flex flex-col justify-between" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
              Orator Skill Map
            </h3>
            <p className="text-xs text-slate-450">Multi-dimensional feedback score</p>
          </div>
          <div className="h-72 w-full text-xs flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="70%" data={skillData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 8 }} />
                <Radar
  name={dashboard?.user?.full_name || "Learner"}
  dataKey="A"
  stroke="#8b5cf6"
  fill="#8b5cf6"
  fillOpacity={0.25}
/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activities and Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Session Activity logs */}
        <Card variant="glass" hoverEffect={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
              Recent Practice History
            </h3>
            <Link to="/learner/reports" className="text-xs font-semibold text-indigo-650 dark:text-brand-400 hover:underline">
              View All History
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/45 dark:bg-darkbg-accent/40 border border-slate-100 dark:border-darkbg-border/60">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${act.badge}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.type} • {act.date}</span>
                  </div>
                </div>
                <span className="text-xs font-black font-display text-indigo-600 dark:text-brand-300 bg-indigo-50 dark:bg-brand-950/45 px-2.5 py-1.5 rounded-lg border border-indigo-150 dark:border-brand-900/60">
                  {act.score}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Actions */}
        <Card variant="glass" hoverEffect={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
              Recommended Challenges
            </h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <IoFlame className="h-3.5 w-3.5" /> High priority
            </span>
          </div>
          <div className="space-y-4">
            {exercises.map((ex, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/45 dark:bg-darkbg-accent/40 border border-slate-100 dark:border-darkbg-border/60 hover:border-indigo-400 dark:hover:border-brand-650 transition-colors group cursor-pointer">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-brand-350 transition-colors flex items-center gap-1.5">
                    <IoBook className="h-3.5 w-3.5 text-slate-400" />
                    {ex.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{ex.type} • {ex.dur}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 rounded">
                    {ex.xp}
                  </span>
                  <IoArrowForward className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LearnerDashboard;
