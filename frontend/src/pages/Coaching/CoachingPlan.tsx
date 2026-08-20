import React, { useEffect, useState } from 'react';
import { coachingAPI } from '../../api/client';
import type { CoachingPlan } from '../../types';

const CoachingPlanPage: React.FC = () => {
  const [plan, setPlan] = useState<CoachingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coachingAPI
      .getPlan()
      .then((res) => setPlan(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Synthesizing Personalized AI Coaching Regimen...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="card text-center py-16">
        <p className="text-slate-400 text-sm">Could not load AI coaching plan from server.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              🎯 AI Personalized Coaching Regimen
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Adaptive Curriculum
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic learning roadmap synthesized by AI based on your historical debate rounds and speech acoustics.
          </p>
        </div>
      </div>

      {/* Current Diagnostic Snapshot */}
      {plan.current_stats && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
            Diagnostic Baseline Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
                📊
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-600 font-mono">{plan.current_stats.avg_debate_score.toFixed(1)}</p>
                <p className="text-xs font-bold text-slate-700">Avg Debate Competency</p>
                <p className="desc-text mt-0.5">Across logic, rebuttal & warrants</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                🎤
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-600 font-mono">{plan.current_stats.avg_presentation_score.toFixed(1)}</p>
                <p className="text-xs font-bold text-slate-700">Avg Speech Score</p>
                <p className="desc-text mt-0.5">Pacing, clarity & vocal fillers</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                📋
              </div>
              <div>
                <p className="text-2xl font-black text-purple-700 font-mono">{plan.current_stats.sessions}</p>
                <p className="text-xs font-bold text-slate-700">Completed Sessions</p>
                <p className="desc-text mt-0.5">Total sample data points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Areas */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🎯</span> High-Priority Growth Domains
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Algorithmically Identified</span>
        </div>

        {plan.focus_areas.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">
            Complete more debates and presentations to generate tailored domain recommendations.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {plan.focus_areas.map((area, i) => (
              <div
                key={i}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="capitalize">{area.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Milestone Goal */}
      <div className="card space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>📅</span> Target Weekly Objective
          </h2>
          <span className="text-[10px] text-indigo-600 font-mono font-bold">Current Cycle</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          {plan.weekly_goals || 'Complete at least 2 structured debate rounds and 1 recorded presentation speech this week.'}
        </p>
      </div>

      {/* Prescribed Training Drills */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>💪</span> AI-Prescribed Training Exercises
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Hands-on Drills</span>
        </div>

        {plan.recommended_exercises.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No specific exercises generated yet.</p>
        ) : (
          <div className="space-y-2.5">
            {plan.recommended_exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed pt-0.5">{ex}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linear Mastery Path */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>🗺️</span> Linear Mastery Learning Path
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Sequential Progression</span>
        </div>

        {plan.learning_path.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No learning path milestones generated yet.</p>
        ) : (
          <div className="space-y-3">
            {plan.learning_path.map((step, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-brand-700 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                  {i + 1}
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Coach Quote */}
      <div className="card bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-indigo-100 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              AI Debate Coach Directive
            </span>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "{plan.motivational_message}"
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CoachingPlanPage;


