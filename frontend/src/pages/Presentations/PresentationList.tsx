import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { presentationsAPI, reportsAPI } from '../../api/client';
import type { Presentation } from '../../types';

const PresentationList: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    presentationsAPI
      .list()
      .then((res) => setPresentations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async (id: number) => {
    try {
      const res = await reportsAPI.presentationPDF(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_${id}_report.pdf`;
      a.click();
    } catch {
      alert('Could not download speech report.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              🎤 Speech & Presentation Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Acoustic & NLP Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review acoustic delivery, vocal filler ratio, emotional tone detection, and download executive speech coaching PDFs.
          </p>
        </div>

        <Link to="/presentations/submit" className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm">
          + Submit New Speech Presentation
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          <p className="text-xs text-slate-500">Loading Speech Presentations...</p>
        </div>
      ) : presentations.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-3xl flex items-center justify-center mx-auto text-emerald-600">
            🎤
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No presentation evaluations recorded</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Submit a speech transcript or upload an audio file to generate automated pace, clarity, and filler word reports.
            </p>
          </div>
          <Link to="/presentations/submit" className="btn-primary text-xs py-2.5 px-5 shadow-sm">
            Submit Your First Speech →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {presentations.map((p) => (
            <div key={p.id} className="card group hover:border-emerald-300 p-5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-emerald-700 border border-slate-200">
                      ID #{p.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 capitalize font-mono">
                      Tone: {p.emotion_detected}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                    {p.title}
                  </h3>

                  {/* 4 NLP Dimensions */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Confidence</span>
                      <strong className="text-indigo-600 font-mono text-sm">{p.confidence_score.toFixed(1)}</strong>
                      <span className="text-[9px] text-slate-400 block">Vocal presence</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Clarity</span>
                      <strong className="text-blue-600 font-mono text-sm">{p.clarity_score.toFixed(1)}</strong>
                      <span className="text-[9px] text-slate-400 block">Lexical density</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Engagement</span>
                      <strong className="text-emerald-600 font-mono text-sm">{p.engagement_score.toFixed(1)}</strong>
                      <span className="text-[9px] text-slate-400 block">Audience interest</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Emotion Tone</span>
                      <strong className="text-purple-700 capitalize text-xs block truncate font-bold">{p.emotion_detected}</strong>
                      <span className="text-[9px] text-slate-400 block">Sentiment</span>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full shadow-xs"
                        style={{ width: `${Math.min(Math.max(p.overall_score * 10, 5), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score & PDF Action */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0 self-end sm:self-start">
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                      {p.overall_score.toFixed(1)}
                      <span className="text-xs text-slate-400 font-normal"> / 10</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadPDF(p.id)}
                    className="btn-secondary text-xs py-1.5 px-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    title="Download executive PDF speech evaluation report"
                  >
                    📄 Download PDF Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresentationList;


