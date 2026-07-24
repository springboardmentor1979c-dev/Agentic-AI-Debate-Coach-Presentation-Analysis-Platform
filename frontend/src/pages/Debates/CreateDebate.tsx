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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to="/debates" className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block">
          ← Back to Debates
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Debate</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Debate Topic *</label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="input-field"
            placeholder="e.g., Should AI replace human decision-making?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            className="input-field"
          >
            <option value="one_on_one">One on One</option>
            <option value="parliamentary">Parliamentary</option>
            <option value="oxford">Oxford</option>
            <option value="policy">Policy</option>
            <option value="public_forum">Public Forum</option>
            <option value="ai_simulation">AI Simulation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Debate Session'}
          </button>
          <Link to="/debates" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateDebate;

