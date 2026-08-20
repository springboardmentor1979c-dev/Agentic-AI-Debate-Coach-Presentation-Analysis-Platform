import React, { useEffect, useState } from 'react';
import { profileAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Profile } from '../../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    experience_level: '',
    goals: '',
    preferred_topics: '',
    coaching_preferences: '',
    presentation_domains: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileAPI
      .get()
      .then((res) => {
        setProfile(res.data);
        setForm({
          experience_level: res.data.experience_level || 'beginner',
          goals: res.data.goals || '',
          preferred_topics: res.data.preferred_topics || '',
          coaching_preferences: res.data.coaching_preferences || '',
          presentation_domains: res.data.presentation_domains || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update(form);
      setProfile(res.data);
      setEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading User Profile & Coaching Preferences...</p>
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
              👤 Debater Profile & AI Coaching Preferences
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Personal Settings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure how the AI debate spar partner critiques your arguments, selects topics, and tailors rubrics.
          </p>
        </div>
      </div>

      {/* User Info Header Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-brand-700 flex items-center justify-center text-white text-2xl font-black shadow-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize font-mono">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Account active with complete role-based evaluation privileges.
              </p>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary text-xs py-2 px-4 self-start sm:self-auto shadow-sm"
            >
              ✏️ Edit Preferences
            </button>
          )}
        </div>
      </div>

      {/* Profile KPI Badges */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono">{profile.debate_count}</p>
              <p className="text-xs font-bold text-slate-700">Debates Completed</p>
              <p className="desc-text mt-0.5">Formal scored sessions</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
              🎤
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono">{profile.presentation_count}</p>
              <p className="text-xs font-bold text-slate-700">Speeches Analyzed</p>
              <p className="desc-text mt-0.5">NLP & acoustic runs</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
              🔥
            </div>
            <div>
              <p className="text-2xl font-black text-orange-600 font-mono">{profile.streak_days} Days</p>
              <p className="text-xs font-bold text-slate-700">Practice Consistency</p>
              <p className="desc-text mt-0.5">Consecutive active days</p>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Form / Display */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>⚙️</span> Personalized AI Coaching Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These settings directly guide the AI's feedback severity and sparring personality.
            </p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level *
              </label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="input-field text-sm"
              >
                <option value="beginner">Beginner — Focus on claim structure, pacing & basic clarity</option>
                <option value="intermediate">Intermediate — Focus on evidence citation, warrants & rebuttal</option>
                <option value="advanced">Advanced — Focus on clash framing, policy impacts & fallacy traps</option>
                <option value="expert">Expert — Tournament mastery, cross-examination & rhetorical strategy</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Calibrates AI feedback threshold and rubric rigor</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personal Debate & Presentation Goals
              </label>
              <textarea
                value={form.goals}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="input-field min-h-[80px] text-sm"
                placeholder="e.g., Prepare for collegiate parliamentary tournaments; eliminate vocal fillers like 'um'."
              />
              <p className="text-[10px] text-slate-400 mt-1">Used to synthesize weekly coaching milestones</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Debate Motions / Topics
              </label>
              <input
                type="text"
                value={form.preferred_topics}
                onChange={(e) => setForm({ ...form, preferred_topics: e.target.value })}
                className="input-field text-sm"
                placeholder="e.g., Technology Ethics, Constitutional Law, Geopolitics, Climate Economics"
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma-separated topics for AI motion recommendations</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                AI Coaching Feedback Style
              </label>
              <input
                type="text"
                value={form.coaching_preferences}
                onChange={(e) => setForm({ ...form, coaching_preferences: e.target.value })}
                className="input-field text-sm"
                placeholder="e.g., Socratic, Rigorous Clash, Encouraging & Constructive"
              />
              <p className="text-[10px] text-slate-400 mt-1">Controls the tone and refutation aggressiveness of the AI coach</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Presentation Domains
              </label>
              <input
                type="text"
                value={form.presentation_domains}
                onChange={(e) => setForm({ ...form, presentation_domains: e.target.value })}
                className="input-field text-sm"
                placeholder="e.g., Academic Symposiums, Executive Keynotes, Competitive Policy"
              />
              <p className="text-[10px] text-slate-400 mt-1">Contextualizes speech pace and audience engagement scoring</p>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs font-bold py-2 px-5 shadow-sm">
                {saving ? 'Saving...' : 'Save Coaching Preferences →'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-2 px-4">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-mono text-[10px] uppercase font-bold">Competency Level</span>
              <p className="text-sm font-bold text-indigo-700 capitalize mt-1">
                {profile?.experience_level || 'Beginner'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Calibrates scoring rigor & agent challenges.</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-mono text-[10px] uppercase font-bold">Debate Goals</span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {profile?.goals || 'Master competitive parliamentary debate'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Guides weekly recommended exercises.</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-mono text-[10px] uppercase font-bold">Preferred Topics</span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {profile?.preferred_topics || 'Technology, Law, Science, Politics'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Suggested motions in sparring studio.</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-mono text-[10px] uppercase font-bold">Coaching Tone Style</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {profile?.coaching_preferences || 'Constructive & Rigorous'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Controls AI sparring personality.</p>
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-mono text-[10px] uppercase font-bold">Presentation Domains</span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {profile?.presentation_domains || 'Academic, Competitive Collegiate, Professional'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Speech pace and lexical density benchmarks.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfilePage;


