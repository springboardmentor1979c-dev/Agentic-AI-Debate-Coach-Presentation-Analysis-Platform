import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Award, FileText, CheckCircle2, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, logout, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        const profile = response.data;
        
        setValue('name', profile.name);
        setValue('experience_level', profile.experience_level || 'Beginner');
        setValue('preferred_topics', profile.preferred_topics || '');
        setValue('presentation_domains', profile.presentation_domains || '');
        setValue('learning_goals', profile.learning_goals || '');
        setValue('coaching_preferences', profile.coaching_preferences || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrorMsg('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);
    try {
      await api.put('/profile', data);
      setSuccessMsg('Profile settings updated successfully.');
      checkAuth(); // update context state
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMsg(error.response?.data?.detail || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/profile');
      logout(); // logout cleans token and redirects
    } catch (error) {
      console.error('Delete account failed:', error);
      setErrorMsg('Failed to delete account. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-xs text-slate-400">Configure speaking experience and learning preferences</p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {successMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                  errors.name ? 'border-red-500' : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
                }`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="text-[10px] text-red-400 font-semibold">{errors.name.message}</span>}
            </div>

            {/* Account Email (Disabled) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 tracking-wide block">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Speaking Experience Level</label>
              <select
                className="w-full bg-[#120b24] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-purple-500/70 cursor-pointer"
                {...register('experience_level')}
              >
                <option value="Beginner">Beginner (No public speaking/debate background)</option>
                <option value="Intermediate">Intermediate (Some classroom presentations)</option>
                <option value="Advanced">Advanced (Frequent public presenter/debater)</option>
                <option value="Expert">Expert (Professional speaking background)</option>
              </select>
            </div>

            {/* Preferred Topics */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Preferred Debate Topics</label>
              <input
                type="text"
                placeholder="e.g. AI Ethics, Climate Policy, Economics"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70 focus:bg-white/[0.08]"
                {...register('preferred_topics')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
            {/* Presentation Domains */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Presentation Domains</label>
              <input
                type="text"
                placeholder="e.g. Technology pitches, Academic conferences"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70"
                {...register('presentation_domains')}
              />
            </div>

            {/* Coaching Preferences */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Coaching Preferences</label>
              <input
                type="text"
                placeholder="e.g. Tone evaluation, Argument structure validation"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70"
                {...register('coaching_preferences')}
              />
            </div>
          </div>

          {/* Learning Goals */}
          <div className="space-y-2 border-t border-white/5 pt-6">
            <label className="text-xs font-semibold text-slate-300 tracking-wide block">Primary Learning Goals</label>
            <textarea
              rows={3}
              placeholder="e.g. I want to build structurally sound counterpoints and eliminate filler words during fast debate rounds."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/70"
              {...register('learning_goals')}
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition duration-200 shadow-md shadow-purple-950/20 text-sm glow-btn cursor-pointer flex items-center justify-center min-w-[120px]"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Dangerous Zone */}
      <div className="glass-panel p-6 rounded-3xl border border-red-500/10 bg-red-950/5 space-y-4">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-light">
          Once you delete your account, all debate history, coaching profiles, and recorded analysis will be permanently erased. This action is irreversible.
        </p>
        
        {showDeleteConfirm ? (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-red-300 font-semibold">Are you absolutely sure you want to delete your account?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer transition duration-150"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold cursor-pointer transition duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition duration-200 text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
