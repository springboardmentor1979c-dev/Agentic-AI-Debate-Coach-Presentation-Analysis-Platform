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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-xl">🎯</div>
            <div>
              <p className="text-2xl font-bold">{profile.debate_count}</p>
              <p className="text-sm text-gray-500">Debates</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-xl">🎤</div>
            <div>
              <p className="text-2xl font-bold">{profile.presentation_count}</p>
              <p className="text-sm text-gray-500">Presentations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">🔥</div>
            <div>
              <p className="text-2xl font-bold">{profile.streak_days}</p>
              <p className="text-sm text-gray-500">Day Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Preferences</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                className="input-field"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
              <textarea
                value={form.goals}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="What do you want to achieve?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Topics</label>
              <input
                type="text"
                value={form.preferred_topics}
                onChange={(e) => setForm({ ...form, preferred_topics: e.target.value })}
                className="input-field"
                placeholder="e.g., Technology, Politics, Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Preferences</label>
              <input
                type="text"
                value={form.coaching_preferences}
                onChange={(e) => setForm({ ...form, coaching_preferences: e.target.value })}
                className="input-field"
                placeholder="e.g., Aggressive, Constructive, Balanced"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presentation Domains</label>
              <input
                type="text"
                value={form.presentation_domains}
                onChange={(e) => setForm({ ...form, presentation_domains: e.target.value })}
                className="input-field"
                placeholder="e.g., Academic, Professional, Technical"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Experience Level</span>
              <p className="font-medium capitalize">{profile?.experience_level || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Goals</span>
              <p className="font-medium">{profile?.goals || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Preferred Topics</span>
              <p className="font-medium">{profile?.preferred_topics || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Coaching Preferences</span>
              <p className="font-medium">{profile?.coaching_preferences || 'Not set'}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500">Presentation Domains</span>
              <p className="font-medium">{profile?.presentation_domains || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Average Scores */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-1">Average Debate Score</h3>
            <p className="text-3xl font-bold text-brand-600">{profile.avg_debate_score.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-1">Average Presentation Score</h3>
            <p className="text-3xl font-bold text-green-600">{profile.avg_presentation_score.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

