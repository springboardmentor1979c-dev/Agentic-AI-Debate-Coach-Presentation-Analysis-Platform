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

  const sampleSpeech = `"Good morning distinguished colleagues. Today, I stand before you to address the accelerating paradigm shift driven by artificial intelligence in global education. 

While critics express legitimate concerns regarding algorithmic bias and academic integrity, the empirical evidence demonstrates that personalized AI tutoring significantly bridges educational disparities in underserved communities. 

However, technology alone is not a panacea. We must implement rigorous oversight frameworks that ensure these cognitive tools augment, rather than displace, the indispensable role of human educators."`;

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
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800">
      <div>
        <Link to="/presentations" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-2 inline-flex items-center gap-1">
          ← Back to Speech & Presentations
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Submit Speech Presentation for AI Coaching
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate speech pacing (WPM), verbal filler frequency, rhetorical clarity, emotional tone, and engagement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Presentation Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Presentation Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-sm"
            placeholder="e.g., Keynote: The Ethical Implications of Autonomous AI Systems"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Displayed on your presentation scorecards and downloadable PDF reports.
          </p>
        </div>

        {/* Audio / Video Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Audio / Video Recording File (Optional)
          </label>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="input-field text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {audioFile ? (
            <p className="text-xs text-emerald-600 mt-1 font-mono font-medium">
              ✓ Attached audio file: {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} KB)
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-1">
              Supports MP3, WAV, M4A, or MP4. If Whisper STT is disabled, transcript text below is utilized directly.
            </p>
          )}
        </div>

        {/* Speech Transcript Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Speech Transcript *
            </label>
            <button
              type="button"
              onClick={() => setTranscript(sampleSpeech)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2"
            >
              Paste Sample Speech Script
            </button>
          </div>
          
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="input-field min-h-[220px] font-mono text-xs leading-relaxed"
            placeholder="Paste or type speech transcript..."
            required
          />
          <p className="text-[10px] text-slate-400">
            Word Count: <span className="text-indigo-600 font-bold font-mono">{transcript.trim() ? transcript.trim().split(/\s+/).length : 0}</span> words
          </p>
        </div>

        {/* Real-time NLP Analysis Dimensions Overview */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔬</span> Automated Speech & NLP Telemetry Analyzed:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-mono font-bold">⚡ Pace (WPM):</span>
              <span className="text-slate-500">Target ~130–160 Words Per Minute</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-mono font-bold">🔍 Filler Ratio:</span>
              <span className="text-slate-500">Um, uh, like, you know frequency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-700 font-mono font-bold">🎭 Emotional Tone:</span>
              <span className="text-slate-500">Confident, enthusiastic, nervous, neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-mono font-bold">🎯 Clarity Index:</span>
              <span className="text-slate-500">Sentence complexity & lexical density</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || !transcript.trim()}
            className="btn-primary text-sm font-bold py-2.5 px-6 shadow-sm"
          >
            {loading ? 'Evaluating Speech Telemetry...' : 'Submit Speech for Analysis →'}
          </button>
          <Link to="/presentations" className="btn-secondary text-sm py-2.5 px-4">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SubmitPresentation;


