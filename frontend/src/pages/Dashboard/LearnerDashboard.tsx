import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api/client';
import type { LearnerDashboard as LearnerDashboardData } from '../../types';

const LearnerDashboard: React.FC = () => {
  const [data, setData] = useState<LearnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .learner()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading Learner Performance Telemetry...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-400 text-sm">Could not load dashboard data from local API server.</p>
      </div>
    );
  }

  const isImproving = data.performance_trend === 'improving';
  const isDeclining = data.performance_trend === 'declining';

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
              Live Learner Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Debate & Speech Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics across argumentation quality, speech acoustics, fallacy detection & AI sparring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai-debate" className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm">
            🤖 Practice AI Sparring
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid with Explanations */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Key Performance Metrics
          </h3>
          <span className="text-[11px] text-slate-400">Updated from session database</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Debates Stat */}
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.debate_count}</p>
                <span className="text-[10px] text-blue-600 font-mono font-bold">Sessions</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Structured Debates</p>
              <p className="desc-text mt-0.5">Formal rounds scored across 5 rubric standards.</p>
            </div>
          </div>

          {/* Presentations Stat */}
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎤
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.presentation_count}</p>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">Analyzed</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Speech Presentations</p>
              <p className="desc-text mt-0.5">NLP speech pace (WPM), fillers & emotion checks.</p>
            </div>
          </div>

          {/* AI Debates Stat */}
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
              🤖
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-slate-900">{data.ai_debate_sessions}</p>
                <span className="text-[10px] text-purple-600 font-mono font-bold">Sparring</span>
              </div>
              <p className="text-xs font-bold text-slate-700">AI Sparring Rounds</p>
              <p className="desc-text mt-0.5">Interactive multi-turn practice against LLM.</p>
            </div>
          </div>

          {/* Performance Trend Stat */}
          <div className="stat-card">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
              isImproving
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : isDeclining
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}>
              📈
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between">
                <p className={`text-2xl font-black capitalize ${
                  isImproving ? 'text-emerald-600' : isDeclining ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  {data.performance_trend}
                </p>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Velocity</span>
              </div>
              <p className="text-xs font-bold text-slate-700">Performance Trend</p>
              <p className="desc-text mt-0.5">Trajectory computed over recent round scores.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Aggregate Score Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Debate Score Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h3 className="font-bold text-sm text-slate-900">Mean Debate Competency Score</h3>
              </div>
              <p className="desc-text mt-1">
                Weighted composite score across Logic, Rebuttal, Evidence, Argument Quality & Delivery.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600">
                {data.avg_debate_score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400"> / 10.0</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-indigo-500 to-brand-600 h-2 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(Math.max(data.avg_debate_score * 10, 5), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
            <span>0.0 (Novice)</span>
            <span>5.0 (Proficient)</span>
            <span>10.0 (Master)</span>
          </div>
        </div>

        {/* Presentation Score Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎤</span>
                <h3 className="font-bold text-sm text-slate-900">Mean Presentation & Speech Score</h3>
              </div>
              <p className="desc-text mt-1">
                Acoustic & NLP analysis evaluating speech pace, filler ratio, clarity and audience engagement.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600">
                {data.avg_presentation_score.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400"> / 10.0</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(Math.max(data.avg_presentation_score * 10, 5), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
            <span>0.0 (Needs Coaching)</span>
            <span>5.0 (Standard)</span>
            <span>10.0 (Exemplary)</span>
          </div>
        </div>

      </div>

      {/* Quick Action Feature Launchpad */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Interactive AI Workflows
          </h3>
          <span className="text-[11px] text-slate-400">Click to launch any workflow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <Link
            to="/debates/create"
            className="card group hover:border-indigo-300 p-4 transition-all duration-200 block text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-blue-50 border border-blue-100 group-hover:scale-105 transition-transform">
                🎯
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Create Debate Session
                </h4>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">One-on-One or Parliamentary</span>
              </div>
            </div>
            <p className="desc-text">
              Configure topics, assign positions, and evaluate arguments with automated rubric scoring.
            </p>
          </Link>

          <Link
            to="/ai-debate"
            className="card group hover:border-indigo-300 p-4 transition-all duration-200 block text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-purple-50 border border-purple-100 group-hover:scale-105 transition-transform">
                🤖
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  AI Debate Sparring
                </h4>
                <span className="text-[10px] text-purple-600 font-mono font-bold">Real-Time LLM Opponent</span>
              </div>
            </div>
            <p className="desc-text">
              Engage in live interactive sparring with real-time counterarguments and fallacy detection.
            </p>
          </Link>

          <Link
            to="/presentations/submit"
            className="card group hover:border-emerald-300 p-4 transition-all duration-200 block text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                🎤
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Submit Presentation
                </h4>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">Acoustic & NLP Engine</span>
              </div>
            </div>
            <p className="desc-text">
              Upload speech audio or transcript to analyze speaking pace, fillers, and confidence.
            </p>
          </Link>

        </div>
      </div>

      {/* Recent History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Recent Debate Scores */}
        <div className="card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Debate Evaluations</h3>
              <p className="text-[11px] text-slate-500">Formal session evaluations from database</p>
            </div>
            <Link to="/debates" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              View All Debates →
            </Link>
          </div>

          {data.recent_scores.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">
              No recent debate scores found. Launch a debate to generate your first score.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recent_scores.map((s) => (
                <div
                  key={s.session_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🎯</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Session #{s.session_id}</p>
                      <p className="text-[10px] text-slate-500">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-600 font-mono">
                      {s.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / 10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Speech Presentations */}
        <div className="card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Speech Presentations</h3>
              <p className="text-[11px] text-slate-500">NLP & acoustic speech evaluations</p>
            </div>
            <Link to="/presentations" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              View All Speeches →
            </Link>
          </div>

          {data.recent_presentations.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center">
              No speech evaluations logged yet. Submit a speech transcript or audio recording.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recent_presentations.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base">🎤</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID #{p.id}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="text-sm font-black text-emerald-600 font-mono">
                      {p.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / 10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LearnerDashboard;


