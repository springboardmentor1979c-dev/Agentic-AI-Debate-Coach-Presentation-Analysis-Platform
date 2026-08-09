import React, { useState } from 'react';
import { 
  Target, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, 
  HelpCircle, RefreshCw, ArrowRight, Lightbulb, BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function ArgumentStudio() {
  const [inputText, setInputText] = useState(
    "You are just an idiot and a fool so your opinion on carbon tax policy is invalid. Either we ban all fossil fuels immediately or the planet will be completely destroyed next week. Furthermore, everyone knows that solar energy never works because it is self-evident."
  );

  const [loading, setLoading] = useState(false);
  const [argumentResult, setArgumentResult] = useState(null);
  const [fallacyResult, setFallacyResult] = useState(null);
  const [counterargResult, setCounterargResult] = useState(null);

  const handleRunAllEngines = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);

    try {
      const [argRes, falRes, cntRes] = await Promise.all([
        api.analyzeArgument(inputText, "Climate Policy"),
        api.detectFallacies(inputText),
        api.generateCounterarguments(inputText, "Climate Policy", "All")
      ]);

      setArgumentResult(argRes);
      setFallacyResult(falRes);
      setCounterargResult(cntRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" /> Argument Mining & Logical Fallacy Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extract claims, detect 8 types of logical fallacies, evaluate evidence strength, and generate 5-perspective counterarguments.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Input Argument Text to Analyze:</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
            placeholder="Paste argument or debate text here..."
          />
        </div>

        <button
          onClick={handleRunAllEngines}
          disabled={loading || !inputText.trim()}
          className="gradient-btn px-6 py-3 rounded-2xl font-bold text-xs text-white shadow-xl flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-200" />}
          {loading ? 'Mining Arguments & Detecting Fallacies...' : 'Run Argument Mining & Fallacy Engines'}
        </button>
      </div>

      {/* Results Grid */}
      {(argumentResult || fallacyResult || counterargResult) && (
        <div className="space-y-6">
          {/* Section 1: Fallacy Detection (8 Supported Fallacies) */}
          <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Logical Fallacy Detection Engine (8 Supported Fallacies)
              </h3>
              <span className="text-xs px-3 py-1 bg-rose-500/20 text-rose-300 rounded-full font-bold border border-rose-500/30">
                Credibility Score: {fallacyResult?.credibility_score}%
              </span>
            </div>

            <p className="text-xs text-slate-300">{fallacyResult?.overall_assessment}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fallacyResult?.fallacies_detected?.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/80 rounded-2xl border border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-400 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      {item.fallacy_type}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Severity: {item.severity}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">{item.detected_phrase}</p>
                  <p className="text-xs text-slate-400"><span className="text-slate-300 font-medium">Explanation:</span> {item.explanation}</p>
                  
                  <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-medium flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-emerald-400">Fix Suggestion:</strong> {item.suggested_correction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Argument Quality & Claim Breakdown */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Claim Extraction & Evidence Assessment
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Persuasiveness Index</p>
                <p className="text-xl font-extrabold text-indigo-400">{argumentResult?.persuasiveness_index}%</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Evidence Score</p>
                <p className="text-xl font-extrabold text-purple-400">{argumentResult?.evidence_score}%</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Reasoning Quality</p>
                <p className="text-xl font-extrabold text-emerald-400">{argumentResult?.reasoning_quality}%</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Clarity Index</p>
                <p className="text-xl font-extrabold text-amber-400">{argumentResult?.clarity_score}%</p>
              </div>
            </div>
          </div>

          {/* Section 3: Counterargument Generation (5 Strategies) */}
          <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 space-y-4">
            <h3 className="font-bold text-base text-indigo-200 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              Counterargument Generation Engine (5 Strategies)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {counterargResult?.counterarguments?.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 px-2.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                      {item.category} Strategy
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200">{item.rebuttal}</p>
                  
                  <div className="space-y-1 text-xs text-slate-300">
                    <p><strong className="text-indigo-400">Key Counterpoint:</strong> {item.key_counterpoint}</p>
                    <p><strong className="text-amber-400">Challenge Question:</strong> {item.challenge_question}</p>
                    <p><strong className="text-emerald-400">Debate Strategy:</strong> {item.debate_strategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
