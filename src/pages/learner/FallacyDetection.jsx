import React, { useState } from 'react';
import Card from '../../components/Card';
import { IoSearch, IoWarning, IoShieldCheckmark, IoBook, IoSparkles } from 'react-icons/io5';

const FallacyDetection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const fallacies = [
    {
      name: "Ad Hominem",
      explanation: "Attacking the opponent's character, personality, or background instead of addressing their substantive argument.",
      severity: "High",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60",
      correction: "Refocus exclusively on the claim, evidence, and logical links presented by the speaker, disregarding their personal attributes.",
      example: "\"We shouldn't accept his infrastructure proposal because he didn't even finish college.\""
    },
    {
      name: "Strawman",
      explanation: "Misrepresenting or exaggerating an opponent's argument to make it easier to attack or refute.",
      severity: "Critical",
      color: "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60",
      correction: "State your opponent's argument fairly and accurately before presenting your counterarguments.",
      example: "\"My opponent wants to reduce defense spending. He wants to leave our country defenseless and open to invasion!\""
    },
    {
      name: "Slippery Slope",
      explanation: "Asserting that a relatively small first step will lead to a chain of negative, catastrophic events without providing logical proof.",
      severity: "Moderate",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60",
      correction: "Establish a direct, evidenced link showing exactly how each step in the chain causes the next.",
      example: "\"If we allow students to use tablets in class, they will stop writing, fail their exams, and never get jobs.\""
    },
    {
      name: "Circular Reasoning",
      explanation: "An argument that commits the fallacy of assuming what it is attempting to prove, creating a logical loop.",
      severity: "High",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60",
      correction: "Introduce independent, external evidence to support your premise rather than restating it in different words.",
      example: "\"The law is just because it is legal, and we must obey it because it is the law.\""
    },
    {
      name: "Appeal to Authority",
      explanation: "Claiming something is true solely because an authority figure said so, especially when that authority is not expert in the topic.",
      severity: "Moderate",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60",
      correction: "Present the concrete studies, research methodology, or underlying data that authority uses to justify their stance.",
      example: "\"The famous actor said this supplement cures insomnia, so it must work.\""
    },
    {
      name: "False Dilemma",
      explanation: "Presenting only two options or outcomes as if they are the only choices, when in fact more alternatives exist.",
      severity: "Critical",
      color: "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60",
      correction: "Acknowledge the nuances and alternative solutions that lie between the two extreme options.",
      example: "\"Either we cut education budgets entirely, or our city goes bankrupt. There is no other option.\""
    },
    {
      name: "Red Herring",
      explanation: "Introducing an irrelevant topic or distraction to divert attention away from the original subject of discussion.",
      severity: "Moderate",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60",
      correction: "Politely point out that the new topic is separate, and pull the focus back to the core issue at hand.",
      example: "\"We shouldn't worry about corporate emissions when individual littering in city parks is so high!\""
    },
    {
      name: "Hasty Generalization",
      explanation: "Drawing a broad conclusion based on a small, non-representative sample size of evidence.",
      severity: "High",
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60",
      correction: "Qualify your claim using terms like 'some' or 'in this instance,' and gather larger dataset samples.",
      example: "\"My electric car's battery died in the cold today. Electric vehicles are completely useless in winter.\""
    }
  ];

  const filteredFallacies = fallacies.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'All' || item.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Logical Fallacy Library
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Identify errors in reasoning, understand their severity, and learn how to construct corrections.
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <Card variant="glass" className="p-4 flex flex-col md:flex-row items-center gap-4 justify-between" hoverEffect={false}>
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logical fallacies..."
            className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl pl-12 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Severity filter buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2 shrink-0">Severity:</span>
          {['All', 'Critical', 'High', 'Moderate'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                filterSeverity === sev
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-indigo-600'
                  : 'border-slate-200 dark:border-darkbg-border hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-600 dark:text-slate-350'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </Card>

      {/* Fallacy Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFallacies.map((item, idx) => (
          <Card key={idx} hoverEffect={true} variant="glass" className="flex flex-col justify-between h-full border border-slate-200/50 dark:border-white/5">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <h3 className="font-display font-extrabold text-base md:text-lg text-slate-800 dark:text-white flex items-center gap-1.5">
                  <IoBook className="text-indigo-500 h-4.5 w-4.5" />
                  {item.name}
                </h3>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${item.color}`}>
                  {item.severity}
                </span>
              </div>

              {/* Explanation */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.explanation}
              </p>

              <hr className="border-slate-150/45 dark:border-darkbg-border" />

              {/* Example */}
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase flex items-center gap-1">
                  <IoWarning className="text-rose-500" /> Example trap
                </span>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 italic mt-1.5 bg-slate-50 dark:bg-darkbg-accent/40 p-2.5 rounded-xl border border-slate-100 dark:border-darkbg-border/60">
                  {item.example}
                </p>
              </div>
            </div>

            {/* Correction */}
            <div className="mt-6 pt-4 border-t border-slate-150/45 dark:border-darkbg-border">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-brand-400 uppercase flex items-center gap-1">
                <IoShieldCheckmark className="text-emerald-500" /> How to correct
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                {item.correction}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FallacyDetection;
