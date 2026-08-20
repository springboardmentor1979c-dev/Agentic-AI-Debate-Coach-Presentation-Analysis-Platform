import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { debatesAPI } from '../../api/client';

const CreateDebate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: '',
    format: 'one_on_one',
    scheduled_at: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDescriptions: Record<string, { label: string; desc: string; structure: string }> = {
    one_on_one: {
      label: '1-on-1 Direct Debate',
      desc: 'Standard affirmative vs negative round with timed opening, cross-examination and rebuttal.',
      structure: '5 min Opening • 3 min Cross-Exam • 3 min Rebuttal',
    },
    parliamentary: {
      label: 'Parliamentary Style (BP / APDA)',
      desc: 'Government proposition vs Opposition benches with Points of Information (POIs).',
      structure: 'Prime Minister • Leader of Opposition • Member Speeches • Whips',
    },
    oxford: {
      label: 'Oxford Union Style',
      desc: 'Formal motion debated by proposer and opposer with pre/post-debate audience division votes.',
      structure: 'Opening Proposer • Opening Opposer • Floor Speeches • Final Summation',
    },
    policy: {
      label: 'Policy Cross-Examination (CX)',
      desc: 'Evidence-heavy debate focusing on enacting or rejecting specific governmental policy reforms.',
      structure: '8 min Constructive • 3 min CX • 5 min Rebuttal',
    },
    public_forum: {
      label: 'Public Forum (PF)',
      desc: 'Accessible, fast-paced current-events debate centered on persuasive advocacy for a general audience.',
      structure: '4 min Constructive • 3 min Crossfire • 2 min Final Focus',
    },
    ai_simulation: {
      label: 'AI Agent Simulation Round',
      desc: 'Automated multi-agent round where autonomous LLM agents spar and critique each other.',
      structure: 'Automated 4-turn Speech & Rebuttal Pipeline',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = { topic: form.topic, format: form.format };
      if (form.scheduled_at) payload.scheduled_at = form.scheduled_at;
      const res = await debatesAPI.create(payload);
      navigate(`/debates/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create debate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800">
      <div>
        <Link to="/debates" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-2 inline-flex items-center gap-1">
          ← Back to All Debate Sessions
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create New Debate Session
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define debate motion, select structural format rules, and schedule the round.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Debate Proposition / Topic Motion *
          </label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="input-field text-sm"
            placeholder="e.g., Resolved: The United States should substantially increase its fiscal investment in nuclear energy."
            required
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Must be formulated as a clear, debatable affirmative resolution.
          </p>
        </div>

        {/* Format Selector with Descriptions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Debate Parliamentary Format Rules *
          </label>
          <select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            className="input-field text-sm"
          >
            {Object.entries(formatDescriptions).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Active Format Explainer Callout */}
          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-1">
              <span>📋 {formatDescriptions[form.format]?.label} Rules</span>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                {formatDescriptions[form.format]?.structure}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {formatDescriptions[form.format]?.desc}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Schedule Session (Optional)
          </label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="input-field text-sm"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Leave blank to launch an immediate live session.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button type="submit" disabled={loading || !form.topic.trim()} className="btn-primary text-sm font-bold py-2.5 px-5 shadow-sm">
            {loading ? 'Creating Session...' : 'Launch Debate Session →'}
          </button>
          <Link to="/debates" className="btn-secondary text-sm py-2.5 px-4">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateDebate;


