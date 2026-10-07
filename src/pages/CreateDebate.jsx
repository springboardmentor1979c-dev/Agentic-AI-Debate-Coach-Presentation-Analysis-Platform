import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Mic, AlertCircle, HelpCircle, Check } from 'lucide-react';

const CreateDebate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      format: 'One-on-One',
      position: 'Affirmative',
      status: 'Scheduled',
    }
  });

  const onSubmit = async (data) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await api.post('/debates', data);
      navigate('/my-debates');
    } catch (error) {
      console.error('Error creating debate:', error);
      setErrorMsg(error.response?.data?.detail || 'Failed to schedule debate session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Debate Session</h2>
          <p className="text-xs text-slate-400">Schedule a new practice debate or AI simulation session</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wide block">Session Title</label>
            <input
              type="text"
              placeholder="e.g. Standard Carbon Tax Oxford Debate"
              className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                errors.title ? 'border-red-500' : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
              }`}
              {...register('title', {
                required: 'Session title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' }
              })}
            />
            {errors.title && <span className="text-[10px] text-red-400 font-semibold">{errors.title.message}</span>}
          </div>

          {/* Topic Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wide block">Debate Topic / Motion</label>
            <textarea
              rows={4}
              placeholder="e.g. Resolved: That governments should enforce a global carbon tax to accelerate carbon neutrality."
              className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 ${
                errors.topic ? 'border-red-500' : 'border-white/10 focus:border-purple-500/70 focus:bg-white/[0.08]'
              }`}
              {...register('topic', {
                required: 'Debate topic motion is required',
                minLength: { value: 3, message: 'Topic must be at least 3 characters' }
              })}
            />
            {errors.topic && <span className="text-[10px] text-red-400 font-semibold">{errors.topic.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Debate Format */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Debate Format</label>
              <select
                className="w-full bg-[#120b24] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-purple-500/70 cursor-pointer"
                {...register('format')}
              >
                <option value="One-on-One">One-on-One Debate</option>
                <option value="Oxford">Oxford Style Debate</option>
                <option value="Parliamentary">Parliamentary Style Debate</option>
                <option value="Policy">Policy Debate</option>
                <option value="Public Forum">Public Forum Debate</option>
              </select>
            </div>

            {/* Speaking Position */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wide block">Speaking Position</label>
              <select
                className="w-full bg-[#120b24] border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-purple-500/70 cursor-pointer"
                {...register('position')}
              >
                <option value="Affirmative">Affirmative (Supporting the motion)</option>
                <option value="Negative">Negative (Opposing the motion)</option>
              </select>
            </div>
          </div>

          {/* Form Info Placeholder */}
          <div className="flex gap-2.5 p-4 rounded-2xl bg-white/2 border border-white/5 text-[11px] text-slate-400 leading-relaxed font-light">
            <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p>
              Once created, this session will show up in your debates schedule. You can edit details or delete it. In Week 2, you'll be able to launch the live debate simulation from this session.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-purple-950/30 text-sm glow-btn cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create & Schedule Session'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDebate;
