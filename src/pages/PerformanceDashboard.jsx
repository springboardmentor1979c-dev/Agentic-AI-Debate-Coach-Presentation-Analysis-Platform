import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Calendar, CheckCircle2, ChevronRight, BarChart2, Compass, ShieldAlert, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PerformanceDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planGoal, setPlanGoal] = useState('Improve logical reasoning');
  const [planDifficulty, setPlanDifficulty] = useState('Intermediate');
  const [planDuration, setPlanDuration] = useState(7);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/debate/performance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPerformance(response.data);
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/debate/learning-plan`, {
        weaknesses: ['Circular reasoning', 'Ad hominem fallacies'],
        goal: planGoal,
        difficulty: planDifficulty,
        duration_days: planDuration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLearningPlan(response.data);
    } catch (err) {
      console.error('Error generating learning plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Personalized Coaching & Performance Dashboard
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your skills rating, progress timeline, and get customized training plans.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall stats */}
            <div className="glass-panel p-6 border border-white/5 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-br from-slate-900/40 to-purple-950/10">
              <div className="text-center md:text-left border-r border-white/5 pr-4 flex flex-col justify-center">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Level Rating</span>
                <h2 className="text-4xl font-extrabold text-purple-300 mt-2">
                  {performance?.trends?.overall_rating || 'Intermediate'}
                </h2>
                <span className="text-[10px] text-slate-500 mt-1">Updated recently</span>
              </div>

              <div className="md:col-span-2 space-y-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Skill Progress averages</span>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(performance?.trends?.average_scores || {
                    "debate": 75.0,
                    "communication": 72.0,
                    "critical_thinking": 78.0
                  }).map(([skill, val]) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300 capitalize font-medium">
                        <span>{skill.replace('_', ' ')}</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress timeline chart mock (SVG) */}
            <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                Improvement Timeline
              </h3>
              
              {/* Premium custom inline SVG line chart */}
              <div className="w-full h-48 bg-slate-950/40 rounded-xl border border-white/5 p-4 flex items-end justify-between relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[10px] text-slate-500">Argument Score Trend</div>
                {/* SVG drawings */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 600 150" preserveAspectRatio="none">
                  <path
                    d="M 50 120 Q 150 90, 250 100 T 450 60 T 550 40"
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="3"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="120" r="5" fill="#8b5cf6" />
                  <circle cx="250" cy="100" r="5" fill="#a78bfa" />
                  <circle cx="450" cy="60" r="5" fill="#3b82f6" />
                  <circle cx="550" cy="40" r="5" fill="#60a5fa" />
                </svg>
                {/* Labels */}
                <div className="text-[10px] text-slate-500 flex w-full justify-between pt-36 px-4 z-10">
                  <span>Match 1</span>
                  <span>Match 2</span>
                  <span>Match 3</span>
                  <span>Match 4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Plan Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Personalized Learning Plan
              </h3>
              
              {!learningPlan ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate an action plan targeting your specific reasoning weaknesses identified during your practice sessions.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Learning Goal</label>
                    <input
                      type="text"
                      value={planGoal}
                      onChange={(e) => setPlanGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Difficulty</label>
                    <select
                      value={planDifficulty}
                      onChange={(e) => setPlanDifficulty(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Duration (Days)</label>
                    <div className="flex gap-2">
                      {[7, 14, 30].map((d) => (
                        <button
                          key={d}
                          onClick={() => setPlanDuration(d)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                            planDuration === d
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                              : 'bg-slate-900 border-white/5 text-slate-400'
                          }`}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition duration-200 flex items-center justify-center gap-2"
                  >
                    {generatingPlan ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Plan
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest block">Goal</span>
                    <p className="text-sm font-semibold">{learningPlan.goal}</p>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {learningPlan.weekly_plan?.[0]?.days?.map((d) => (
                      <div key={d.day} className="flex gap-3 items-start border border-white/5 bg-slate-950/20 p-3 rounded-xl">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {d.day}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200">{d.exercise}</span>
                          <p className="text-[10px] text-slate-400 leading-normal">{d.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setLearningPlan(null)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Configure Another Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
