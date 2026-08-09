import React, { useState, useEffect } from 'react';
import { 
  Award, Download, FileSpreadsheet, Lightbulb, CheckCircle2, 
  ArrowRight, Sparkles, Target, BarChart2
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportsAndCoaching() {
  const [coachingData, setCoachingData] = useState({
    personalized_feedback: [
      {
        category: "Logical Consistency",
        priority: "High",
        recommendation: "Watch out for Straw Man premises when refuting opposing economic claims.",
        drill: "Complete 3 Socratic Reframing exercises in the Argument Studio."
      },
      {
        category: "Presentation Delivery",
        priority: "Medium",
        recommendation: "Reduce verbal fillers ('um', 'you know') during introductory hooks.",
        drill: "Perform a 2-minute timed speech with zero-filler enforcement in the Presentation Lab."
      }
    ],
    learning_path: [
      { step: 1, title: "Foundations of Toulmin Argument Structure", status: "Completed" },
      { step: 2, title: "Detecting & Neutralizing 8 Core Fallacies", status: "In-Progress" },
      { step: 3, title: "Advanced 4-Step Rebuttal & Cross-Examination", status: "Upcoming" },
      { step: 4, title: "Public Forum & Parliamentary AI Simulations", status: "Locked" }
    ]
  });

  const [argQuality, setArgQuality] = useState(84.0);
  const [evidence, setEvidence] = useState(80.0);
  const [logic, setLogic] = useState(85.0);
  const [rebuttal, setRebuttal] = useState(78.0);
  const [comm, setComm] = useState(83.0);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    api.getCoachingRecommendations().then(setCoachingData).catch(() => {});
    calculateScore();
  }, []);

  const calculateScore = async () => {
    try {
      const res = await api.calculateScore({
        argument_quality: argQuality,
        evidence_usage: evidence,
        logical_consistency: logic,
        rebuttal_effectiveness: rebuttal,
        communication_skills: comm
      });
      setScoreResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPdf = () => {
    window.open(api.getPdfReportUrl(101), '_blank');
  };

  const handleDownloadExcel = () => {
    window.open(api.getExcelAnalyticsUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" /> Scoring Engine & Personalized Coaching
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate official weighted scores (30/20/20/15/15), export PDF scorecards, and track skill path progression.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="gradient-btn px-4 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={handleDownloadExcel}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Interactive Scoring Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Calculator Sliders */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" /> Performance Scoring Engine Simulator
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Argument Quality (30%)', val: argQuality, set: setArgQuality },
              { label: 'Evidence Usage (20%)', val: evidence, set: setEvidence },
              { label: 'Logical Consistency (20%)', val: logic, set: setLogic },
              { label: 'Rebuttal Effectiveness (15%)', val: rebuttal, set: setRebuttal },
              { label: 'Communication Skills (15%)', val: comm, set: setComm },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{item.label}</span>
                  <span className="text-indigo-400 font-bold">{item.val}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.val}
                  onChange={(e) => { item.set(parseFloat(e.target.value)); calculateScore(); }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={calculateScore}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md"
          >
            Re-Calculate Weighted Score
          </button>
        </div>

        {/* Calculated Result Scorecard */}
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Calculated Result</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                {scoreResult?.rating_tier || 'Proficient Debater'}
              </span>
            </div>

            <div className="text-center py-6">
              <p className="text-xs text-slate-400 font-medium">Weighted Overall Score</p>
              <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-1">
                {scoreResult?.overall_score || 82.4}%
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Key Strengths:</p>
              {scoreResult?.strengths?.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button onClick={handleDownloadPdf} className="text-xs font-semibold text-indigo-300 hover:underline flex items-center gap-1">
              Download PDF Official Scorecard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Personalized Learning Path */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-400" /> Personalized Skill Development Path
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {coachingData.learning_path?.map((step) => (
            <div 
              key={step.step}
              className={`p-4 rounded-2xl border space-y-2 ${
                step.status === "Completed" 
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200" 
                  : step.status === "In-Progress"
                  ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-100"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/50">
                  Step {step.step}
                </span>
                <span className="text-[10px] font-semibold">{step.status}</span>
              </div>
              <p className="text-xs font-bold leading-snug">{step.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
