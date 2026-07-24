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
      alert('Could not download report.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presentations</h1>
          <p className="text-gray-500 mt-1">AI-powered presentation analysis</p>
        </div>
        <Link to="/presentations/submit" className="btn-primary">
          + Submit Presentation
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      ) : presentations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎤</p>
          <p className="text-gray-500 mb-4">No presentations analyzed yet</p>
          <Link to="/presentations/submit" className="btn-primary">
            Submit Your First Presentation
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {presentations.map((p) => (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                    <span>Confidence: {p.confidence_score.toFixed(1)}</span>
                    <span>Clarity: {p.clarity_score.toFixed(1)}</span>
                    <span>Engagement: {p.engagement_score.toFixed(1)}</span>
                    <span>Emotion: {p.emotion_detected}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${p.overall_score * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-green-600">{p.overall_score.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => downloadPDF(p.id)}
                    className="text-xs text-brand-600 hover:text-brand-700 mt-1"
                  >
                    📄 PDF Report
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

