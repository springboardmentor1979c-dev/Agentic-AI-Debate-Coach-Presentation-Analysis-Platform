import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { presentationsAPI } from '../../api/client';

const SubmitPresentation: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    setError('');
    setLoading(true);
    try {
      const payloadTitle = title.trim() || 'Untitled Presentation';
      if (audioFile) {
        await presentationsAPI.upload({
          title: payloadTitle,
          transcript,
          audio: audioFile,
        });
      } else {
        await presentationsAPI.create({
          title: payloadTitle,
          transcript,
        });
      }
      navigate(`/presentations`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit presentation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link to="/presentations" className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block">
          ← Back to Presentations
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Submit Presentation</h1>
        <p className="text-gray-500 mt-1">Paste your speech transcript for AI-powered analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., My Practice Presentation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio or Video (optional)</label>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="input-field"
          />
          {audioFile && (
            <p className="text-xs text-gray-500 mt-1">
              Attached: {audioFile.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Speech Transcript *</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="input-field min-h-[250px] font-mono text-sm"
            placeholder={`Paste your speech transcript here...

Example:
"Good morning everyone. Today I want to talk about the impact of artificial intelligence on modern education. AI has the potential to transform how we learn, making education more personalized and accessible. However, we must also consider the ethical implications and ensure that technology serves humanity, not the other way around..."`}
            required
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || !transcript.trim()} className="btn-primary">
            {loading ? 'Analyzing...' : 'Submit for Analysis'}
          </button>
          <Link to="/presentations" className="btn-secondary">
            Cancel
          </Link>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">💡 What the AI analyzes:</p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700">
            <li>Speech pace and clarity</li>
            <li>Filler word detection (um, uh, like, etc.)</li>
            <li>Confidence and engagement levels</li>
            <li>Emotional tone analysis</li>
            <li>Personalized coaching feedback</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default SubmitPresentation;

