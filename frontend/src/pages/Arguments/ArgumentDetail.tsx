import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { argumentsAPI } from '../../api/client';
import type { Fallacy, Counterargument } from '../../types';

const ArgumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fallacies, setFallacies] = useState<Fallacy[]>([]);
  const [counterarguments, setCounterarguments] = useState<Counterargument[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullAnalysis, setFullAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      argumentsAPI.getFallacies(Number(id)).catch(() => ({ data: [] })),
      argumentsAPI.getCounterarguments(Number(id)).catch(() => ({ data: [] })),
    ])
      .then(([fRes, cRes]) => {
        setFallacies(fRes.data);
        setCounterarguments(cRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const runFullAnalysis = async () => {
    if (!id) return;
    setAnalysisLoading(true);
    try {
      const res = await argumentsAPI.fullAnalysis(Number(id));
      setFullAnalysis(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/debates" className="text-sm text-brand-600 hover:text-brand-700 mb-2 inline-block">
          ← Back to Debates
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Argument Analysis</h1>
        <p className="text-gray-500 mt-1">AI-powered fallacy detection and counterargument generation</p>
      </div>

      {/* Full Analysis Button */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">🤖 Agentic AI Pipeline</h2>
        <p className="text-sm text-gray-500 mb-3">
          Run the full multi-agent pipeline: Speech → Argument → Fallacy → Rebuttal agents
        </p>
        <button
          onClick={runFullAnalysis}
          disabled={analysisLoading}
          className="btn-primary"
        >
          {analysisLoading ? 'Running Analysis...' : 'Run Full AI Analysis'}
        </button>
        {fullAnalysis && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
            <pre className="whitespace-pre-wrap text-gray-700">{JSON.stringify(fullAnalysis, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Fallacies */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">🔍 Detected Fallacies</h2>
        {fallacies.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No fallacies detected yet. Run the full analysis above.</p>
        ) : (
          <div className="space-y-4">
            {fallacies.map((f) => (
              <div key={f.id} className="border border-red-100 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-700">{f.fallacy_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                    {(f.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{f.explanation}</p>
                {f.correction && (
                  <div className="bg-white rounded p-2 text-sm text-green-700 border border-green-200">
                    💡 Correction: {f.correction}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Detected by: {f.detected_by}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Counterarguments */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">⚡ Generated Counterarguments</h2>
        {counterarguments.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No counterarguments generated yet.</p>
        ) : (
          <div className="space-y-4">
            {counterarguments.map((c) => (
              <div key={c.id} className="border border-brand-100 rounded-lg p-4 bg-brand-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-brand-700 capitalize">{c.counter_type}</span>
                  <span className="text-xs bg-brand-200 text-brand-800 px-2 py-0.5 rounded-full">
                    {c.generated_by}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{c.content}</p>
                {c.strategy && (
                  <p className="text-xs text-gray-500">Strategy: {c.strategy}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArgumentDetail;

