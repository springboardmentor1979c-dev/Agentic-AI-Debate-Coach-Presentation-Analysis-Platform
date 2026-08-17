import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  IoCheckmarkCircle, IoAlertCircle, IoSparkles, IoDocumentText, 
  IoAnalytics, IoShieldCheckmark, IoStatsChart 
} from 'react-icons/io5';

const ArgumentAnalysis = () => {
  const [argument, setArgument] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!argument.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResults({
        extractedClaim: "Tax reductions are necessary to incentivize work, prevent economic collapse, and sustain general productivity.",
        evidenceFound: "No statistical data or credible studies were cited to back up this claim. It relies purely on logical deduction.",
        reasoningQuality: "Moderate. While the flow of cause-and-effect makes sense internally (Taxes -> Motivation -> Productivity -> Economy), it relies on extreme speculative outcomes (economic collapse).",
        persuasiveness: 65,
        strength: "Moderate / Theoretical",
        consistency: 90,
        modelConfidence: 94,
        keyAssumptions: [
          "High taxes significantly discourage people from working.",
          "Economic productivity is directly tied to taxation rates rather than external variables."
        ]
      });
    }, 2000);
  };

  const loadExample = () => {
    setArgument("We must lower corporate tax rates because high taxes discourage businesses from hiring local workers. If hiring stops, unemployment rises, consumer spending drops, and we will face a severe recession.");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          Argument Analysis & Structure Scan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste a paragraph of your speech to evaluate evidentiary support and logical structure.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Input Panel */}
        <Card variant="glass" className="lg:col-span-1 flex flex-col justify-between" hoverEffect={false}>
          <form onSubmit={handleScan} className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Paste Speech Argument</label>
                <button
                  type="button"
                  onClick={loadExample}
                  className="text-xs font-bold text-indigo-600 dark:text-brand-400 hover:underline"
                >
                  Load Example
                </button>
              </div>
              <textarea
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                placeholder="Type or paste your argument case here (Min 100 characters)..."
                className="w-full h-80 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
              />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-darkbg-border flex gap-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isScanning}
                disabled={!argument.trim() || argument.length < 20}
                className="w-full"
              >
                Scan Argument
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {isScanning ? (
            /* Shimmer Loading */
            <Card variant="glass" className="p-12 text-center" hoverEffect={false}>
              <div className="max-w-md mx-auto py-12 flex flex-col items-center">
                <div className="h-14 w-14 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-6" />
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">Scanning Logical Flow...</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 max-w-xs leading-relaxed">
                  Extracting primary claims, cross-checking database source backings, and rating reasoning structures...
                </p>
              </div>
            </Card>
          ) : results ? (
            /* Analysis Results */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Score card rows */}
              <div className="grid sm:grid-cols-3 gap-4">
                
                <Card variant="deep" className="p-5 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Persuasiveness</span>
                  <div className="mt-4">
                    <span className="text-2xl font-black font-display text-indigo-600 dark:text-brand-350">{results.persuasiveness}%</span>
                    <div className="w-full bg-slate-150 dark:bg-darkbg-accent h-1 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-indigo-500" style={{ width: `${results.persuasiveness}%` }} />
                    </div>
                  </div>
                </Card>

                <Card variant="deep" className="p-5 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consistency</span>
                  <div className="mt-4">
                    <span className="text-2xl font-black font-display text-emerald-500">{results.consistency}%</span>
                    <div className="w-full bg-slate-150 dark:bg-darkbg-accent h-1 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-emerald-500" style={{ width: `${results.consistency}%` }} />
                    </div>
                  </div>
                </Card>

                <Card variant="deep" className="p-5 flex flex-col justify-between" hoverEffect={false}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Argument Strength</span>
                  <div className="mt-4">
                    <span className="text-sm font-black font-display text-slate-800 dark:text-slate-200 block truncate">{results.strength}</span>
                    <span className="text-[9px] text-slate-400 block mt-1">Evaluation category</span>
                  </div>
                </Card>

              </div>

              {/* Extraction items */}
              <Card variant="glass" hoverEffect={false} className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase mb-2 flex items-center gap-1.5">
                    <IoDocumentText className="text-indigo-500" /> Extracted Primary Claim
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-darkbg-accent/40 p-3 rounded-xl border border-slate-100 dark:border-darkbg-border/60">
                    {results.extractedClaim}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase mb-2 flex items-center gap-1.5">
                    <IoShieldCheckmark className="text-indigo-500" /> Evidence Audit
                  </h4>
                  <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                    {results.evidenceFound}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase mb-2 flex items-center gap-1.5">
                    <IoAnalytics className="text-indigo-500" /> Reasoning Quality & Logic
                  </h4>
                  <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                    {results.reasoningQuality}
                  </p>
                </div>

                <hr className="border-slate-100 dark:border-darkbg-border" />

                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase mb-3">Underlying Assumptions</h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                    {results.keyAssumptions.map((ass, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <IoAlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Bottom reset actions */}
              <div className="flex justify-end">
                <Button onClick={() => setResults(null)} variant="outline">
                  Analyze Another Case
                </Button>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex items-center justify-center">
              <Card variant="glass" className="text-center p-8 max-w-sm" hoverEffect={false}>
                <div className="p-4 bg-indigo-50 dark:bg-darkbg-accent text-indigo-500 dark:text-brand-400 rounded-2xl mb-4 inline-block">
                  <IoStatsChart className="h-8 w-8" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">No Argument Checked Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                  Type your speech or debate argument on the left and click Scan to parse its reasoning structure.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArgumentAnalysis;
