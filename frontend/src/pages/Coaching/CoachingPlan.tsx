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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Could not load coaching plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎯 AI Coaching Plan</h1>
        <p className="text-gray-500 mt-1">Personalized AI-generated coaching recommendations</p>
      </div>

      {/* Stats */}
      {plan.current_stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-2xl font-bold">{plan.current_stats.avg_debate_score.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Avg Debate Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">🎤</div>
            <div>
              <p className="text-2xl font-bold">{plan.current_stats.avg_presentation_score.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Avg Presentation Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">📋</div>
            <div>
              <p className="text-2xl font-bold">{plan.current_stats.sessions}</p>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Focus Areas */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">🎯 Focus Areas</h2>
        {plan.focus_areas.length === 0 ? (
          <p className="text-gray-400 text-sm">No focus areas identified yet. Complete more debates to get personalized insights.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {plan.focus_areas.map((area, i) => (
              <span key={i} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                {area.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Goals */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">📅 Weekly Goals</h2>
        {plan.weekly_goals ? (
          <p className="text-gray-700">{plan.weekly_goals}</p>
        ) : (
          <p className="text-gray-400 text-sm">No weekly goals set yet.</p>
        )}
      </div>

      {/* Recommended Exercises */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">💪 Recommended Exercises</h2>
        {plan.recommended_exercises.length === 0 ? (
          <p className="text-gray-400 text-sm">No exercises recommended yet.</p>
        ) : (
          <div className="space-y-3">
            {plan.recommended_exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-brand-600 font-bold">{i + 1}.</span>
                <p className="text-sm text-gray-700">{ex}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Learning Path */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">🗺️ Learning Path</h2>
        {plan.learning_path.length === 0 ? (
          <p className="text-gray-400 text-sm">No learning milestones yet.</p>
        ) : (
          <div className="space-y-3">
            {plan.learning_path.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="card bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200">
        <p className="text-lg font-medium text-brand-800 italic">"{plan.motivational_message}"</p>
      </div>
    </div>
  );
};

export default CoachingPlanPage;

