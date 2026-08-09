import React, { useState } from 'react';
import { Mic, Activity, Volume2, Award, Zap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import SpeechRecorder from '../components/SpeechRecorder';
import { api } from '../services/api';

export default function PresentationLab() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSpeechAnalyze = async (transcriptText, durationSec) => {
    setLoading(true);
    try {
      const res = await api.analyzeSpeech(transcriptText, "Keynote Presentation", "Public Speaking", durationSec);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Mic className="w-6 h-6 text-purple-400" /> Speech & Presentation Intelligence Lab
        </h2>
        <p className="text-xs text-slate-400">
          Analyze speaking pace (WPM), filler words ('um', 'like', 'you know'), confidence score, clarity, and audience engagement.
        </p>
      </div>

      {/* Speech Recorder */}
      <SpeechRecorder onAnalyze={handleSpeechAnalyze} />

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Speaking Pace</p>
              <p className="text-2xl font-extrabold text-indigo-400">{result.words_per_minute} <span className="text-xs font-normal">WPM</span></p>
              <span className="text-[10px] text-indigo-300 font-medium">{result.pace_assessment}</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Filler Words Count</p>
              <p className="text-2xl font-extrabold text-rose-400">{result.filler_word_count}</p>
              <span className="text-[10px] text-rose-300 font-medium">Verbal Fillers</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Confidence Score</p>
              <p className="text-2xl font-extrabold text-emerald-400">{result.confidence_score}%</p>
              <span className="text-[10px] text-emerald-300 font-medium">Vocal Dynamics</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Clarity Score</p>
              <p className="text-2xl font-extrabold text-purple-400">{result.clarity_score}%</p>
              <span className="text-[10px] text-purple-300 font-medium">Articulation</span>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 col-span-2 md:col-span-1">
              <p className="text-xs text-slate-400 font-semibold">Audience Engagement</p>
              <p className="text-2xl font-extrabold text-amber-400">{result.engagement_score}%</p>
              <span className="text-[10px] text-amber-300 font-medium">Overall Pitch</span>
            </div>
          </div>

          {/* Filler Breakdown & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" /> Filler Word Breakdown
              </h3>
              {result.filler_breakdown?.length > 0 ? (
                <div className="space-y-2">
                  {result.filler_breakdown.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-slate-200 uppercase">"{f.word}"</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold">
                        {f.count} times
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Outstanding speech hygiene! Zero filler words detected.
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Actionable Speech Coaching Tips
              </h3>
              <div className="space-y-2">
                {result.key_recommendations?.map((rec, i) => (
                  <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
