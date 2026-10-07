import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Play, Sparkles, UserCheck, Calendar, ListTodo, PlusCircle, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch debates
        const debatesResponse = await api.get('/debates');
        setDebates(debatesResponse.data);

        // Fetch profile to calculate completion
        const profileResponse = await api.get('/profile');
        const profile = profileResponse.data;
        
        let fieldsFilled = 0;
        const totalFields = 5;
        if (profile.experience_level) fieldsFilled++;
        if (profile.preferred_topics) fieldsFilled++;
        if (profile.presentation_domains) fieldsFilled++;
        if (profile.learning_goals) fieldsFilled++;
        if (profile.coaching_preferences) fieldsFilled++;
        
        setProfileCompletion(Math.round((fieldsFilled / totalFields) * 100));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Debates', value: debates.length, icon: BookOpen, color: 'text-blue-400' },
    { title: 'Completed', value: debates.filter(d => d.status === 'Completed').length, icon: UserCheck, color: 'text-emerald-400' },
    { title: 'Scheduled', value: debates.filter(d => d.status === 'Scheduled').length, icon: Calendar, color: 'text-purple-400' },
    { title: 'Profile Setup', value: `${profileCompletion}%`, icon: ListTodo, color: 'text-amber-400' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-purple-950/20 via-[#0d061f] to-blue-950/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 relative space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Active
          </div>
          <h2 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h2>
          <p className="text-slate-400 text-sm max-w-xl font-light">
            Ready to polish your argumentation? You can schedule debate practice sessions, configure your speaking profile, and review detailed logical fallacy audits.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Debates Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Debate Practice Sessions</h3>
            <Link to="/my-debates" className="text-xs text-purple-400 font-semibold flex items-center gap-1 hover:text-purple-300 transition duration-200">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {debates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-white/2 rounded-2xl border border-dashed border-white/5">
              <Clock className="w-10 h-10 text-slate-500" />
              <p className="text-slate-400 text-sm">No debate sessions created yet.</p>
              <Link to="/create-debate" className="text-xs px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition duration-200 shadow-md shadow-purple-950/20">
                Start First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {debates.slice(0, 3).map((debate) => (
                <div key={debate.id} className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition duration-200">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">{debate.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{debate.topic}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 font-semibold">
                      {debate.format}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      debate.status === 'Completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-purple-500/20 bg-purple-500/10 text-purple-300'
                    } font-semibold`}>
                      {debate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Placeholder */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/create-debate" className="flex items-center gap-2 p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white transition duration-200 text-sm font-semibold">
                <PlusCircle className="w-4 h-4 text-purple-400" />
                Schedule New Debate
              </Link>
              <Link to="/profile" className="flex items-center gap-2 p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white transition duration-200 text-sm font-semibold">
                <UserCheck className="w-4 h-4 text-blue-400" />
                Configure Experience Settings
              </Link>
            </div>
          </div>

          {/* Upcoming Debate Placeholder */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-blue-950/20 to-purple-950/20 space-y-3 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-600/10 rounded-full blur-xl"></div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Upcoming Simulators (Week 2)
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              You will be able to launch live debate audio recording and face real-time AI cross-examiners directly from this dashboard starting next week.
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
