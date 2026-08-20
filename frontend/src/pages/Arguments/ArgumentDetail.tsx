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
      // reload fallacies and counterarguments
      const [fRes, cRes] = await Promise.all([
        argumentsAPI.getFallacies(Number(id)).catch(() => ({ data: [] })),
        argumentsAPI.getCounterarguments(Number(id)).catch(() => ({ data: [] })),
      ]);
      setFallacies(fRes.data);
      setCounterarguments(cRes.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Analysis failed.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        <p className="text-xs text-slate-400">Loading Multi-Agent Argument Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div>
        <Link to="/debates" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold mb-2 inline-flex items-center gap-1">
          ← Back to Debates
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Argument Intelligence & Fallacy Analyzer
          </h1>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Argument #{id}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automated multi-agent pipeline diagnosing logical validity, rhetoric fallacies, and generating strategic counterarguments.
        </p>
      </div>

      {/* 4-Stage Agentic Pipeline Execution Card */}
      <div className="card border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 shadow-sm space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Multi-Agent Agentic Pipeline
            </h2>
            <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              4 Autonomous Agents
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Executes a sequential LangChain agent chain across Speech Acoustic, Argument Decomposition, Fallacy Detection, and Strategic Rebuttal agents.
          </p>
        </div>

        {/* 4 Steps Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-lg">🎙️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">1. Speech Agent</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Pace, filler ratio, clarity & acoustics</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-lg">📝</span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">2. Argument Agent</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Deconstructs claims, warrants & backing</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-lg">🔍</span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">3. Fallacy Agent</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Scans 20+ logical & rhetoric fallacies</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-lg">🛡️</span>
            <h4 className="text-xs font-bold text-slate-900 mt-1">4. Rebuttal Agent</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Synthesizes multi-angle clash strategies</p>
          </div>
        </div>

        <button
          onClick={runFullAnalysis}
          disabled={analysisLoading}
          className="btn-primary w-full py-3 text-xs font-bold shadow-sm"
        >
          {analysisLoading ? 'Executing Multi-Agent Chain...' : '⚡ Trigger 4-Agent AI Pipeline Analysis →'}
        </button>

        {fullAnalysis && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-700 font-bold">
              <span>Pipeline Execution Telemetry</span>
              <span className="font-mono text-[10px] text-slate-500">
                Latency: {fullAnalysis.pipeline_latency_ms ?? 16}ms • Agents: {fullAnalysis.agents_executed?.length ?? 4}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-slate-700 font-mono text-[11px] max-h-60 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
              {JSON.stringify(fullAnalysis, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Detected Fallacies Section */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🔍</span> Detected Logical & Rhetorical Fallacies ({fallacies.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified informal fallacies (Ad Hominem, Straw Man, False Dilemma, Slippery Slope, etc.)
            </p>
          </div>
        </div>

        {fallacies.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">
            No logical fallacies flagged. Run the full analysis above or submit a longer argument speech.
          </p>
        ) : (
          <div className="space-y-3">
            {fallacies.map((f) => (
              <div key={f.id} className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span className="font-bold text-sm text-rose-800 capitalize">
                      {f.fallacy_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                    {(f.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {f.explanation}
                </p>

                {f.correction && (
                  <div className="bg-white rounded-lg p-3 border border-emerald-200 text-xs text-emerald-800 space-y-1 shadow-2xs">
                    <span className="font-bold uppercase text-[10px] tracking-wider text-emerald-700 block">
                      💡 AI Repair Guidance (How to Fix Warrant):
                    </span>
                    <p className="text-slate-600">{f.correction}</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Detected by: <span className="text-indigo-600 font-bold">{f.detected_by}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategic Generated Counterarguments */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🛡️</span> Strategic Counterarguments & Refutations ({counterarguments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synthesized by the Rebuttal Agent utilizing logical, ethical, and empirical counter-framing.
            </p>
          </div>
        </div>

        {counterarguments.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">
            No counterarguments synthesized yet. Trigger the multi-agent pipeline above.
          </p>
        ) : (
          <div className="space-y-3">
            {counterarguments.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase font-mono bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {c.counter_type} Clash Angle
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Synthesized by {c.generated_by}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {c.content}
                </p>

                {c.strategy && (
                  <div className="text-[11px] text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                    <strong className="text-slate-600 font-mono">Strategic Tactic:</strong> {c.strategy}
                  </div>
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


