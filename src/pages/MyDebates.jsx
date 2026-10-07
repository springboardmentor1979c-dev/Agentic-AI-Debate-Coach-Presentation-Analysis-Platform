import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, Calendar, Trash2, Edit2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

const MyDebates = () => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchDebates = async () => {
    try {
      const response = await api.get('/debates');
      setDebates(response.data);
    } catch (error) {
      console.error('Error fetching debates:', error);
      setErrorMsg('Failed to load debate sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebates();
  }, []);

  const handleStartEdit = (debate) => {
    setEditingId(debate.id);
    setValue('title', debate.title);
    setValue('topic', debate.topic);
    setValue('format', debate.format);
    setValue('position', debate.position);
    setValue('status', debate.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const onSaveEdit = async (data) => {
    setErrorMsg('');
    try {
      await api.put(`/debates/${editingId}`, data);
      setEditingId(null);
      fetchDebates();
    } catch (error) {
      console.error('Error updating debate:', error);
      setErrorMsg('Failed to update debate details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this debate session?')) return;
    setErrorMsg('');
    try {
      await api.delete(`/debates/${id}`);
      fetchDebates();
    } catch (error) {
      console.error('Error deleting debate:', error);
      setErrorMsg('Failed to delete debate session.');
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">My Debates</h2>
          <p className="text-xs text-slate-400">Manage and edit your scheduled and archived debate sessions</p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300 text-sm">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {debates.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No debate sessions scheduled</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
            Create your first debate practice session using the scheduler to get started with presentation analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {debates.map((debate) => (
            <div key={debate.id} className="glass-panel p-6 rounded-2xl border border-white/5 relative">
              {editingId === debate.id ? (
                /* Edit Mode Form */
                <form onSubmit={handleSubmit(onSaveEdit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                        {...register('title', { required: true })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Format</label>
                      <select
                        className="w-full bg-[#120b24] border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none cursor-pointer"
                        {...register('format')}
                      >
                        <option value="One-on-One">One-on-One</option>
                        <option value="Oxford">Oxford</option>
                        <option value="Parliamentary">Parliamentary</option>
                        <option value="Policy">Policy</option>
                        <option value="Public Forum">Public Forum</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Topic Motion</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                      {...register('topic', { required: true })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Position</label>
                      <select
                        className="w-full bg-[#120b24] border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none cursor-pointer"
                        {...register('position')}
                      >
                        <option value="Affirmative">Affirmative</option>
                        <option value="Negative">Negative</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Status</label>
                      <select
                        className="w-full bg-[#120b24] border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none cursor-pointer"
                        {...register('status')}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition duration-150"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs cursor-pointer transition duration-150"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{debate.title}</h3>
                      <span className="text-[9px] font-medium tracking-widest uppercase px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/20 rounded text-blue-400">
                        {debate.format}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">{debate.topic}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Created: {new Date(debate.created_at).toLocaleDateString()}
                      </div>
                      <span className="font-semibold text-purple-400">Position: {debate.position}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        debate.status === 'Completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-purple-500/20 bg-purple-500/10 text-purple-300'
                      }`}>
                        {debate.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleStartEdit(debate)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 transition duration-150 cursor-pointer"
                      title="Edit Debate"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(debate.id)}
                      className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 text-red-400 transition duration-150 cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDebates;
