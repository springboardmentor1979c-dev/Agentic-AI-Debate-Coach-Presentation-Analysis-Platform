import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  IoCopy, IoDownload, IoSparkles, IoShieldCheckmark, IoSkull, 
  IoHelpCircle, IoArrowForward, IoCheckmarkDoneSharp 
} from 'react-icons/io5';

const CounterargumentGenerator = () => {
  const [claim, setClaim] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rebuttals, setRebuttals] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!claim.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setRebuttals([
        {
          type: "Logical Rebuttal",
          icon: IoSparkles,
          color: "text-indigo-500",
          text: "Writing speed is only a fraction of software engineering. LLMs automate syntax writing, but software engineering requires system architecture, client communication, complex business logic integration, and debugging legacy systems, which AI cannot resolve autonomously."
        },
        {
          type: "Evidence-Based Rebuttal",
          icon: IoShieldCheckmark,
          color: "text-emerald-500",
          text: "Historical precedents show automation increases demand. For example, the introduction of spreadsheets in the 1980s did not eliminate accountants; it shifted their role to higher-value analytical consultation. Research shows AI code tools increase developer efficiency by 55%, driving projects to launch faster, creating more total jobs."
        },
        {
          type: "Ethical Rebuttal",
          icon: IoSkull,
          color: "text-rose-500",
          text: "Blind reliance on generative AI outputs poses major risks regarding software security, biased data pipelines, and copyrighted code leaks. Humans must remain accountable to check and sign off on codebase integrity for legal and safety reasons."
        },
        {
          type: "Alternative Viewpoint",
          icon: IoArrowForward,
          color: "text-blue-500",
          text: "The future is a developer-agent co-pilot hybrid model. Instead of replacing engineers, LLMs lower the barrier of entry, transitioning software developers into high-level system designers who manage fleets of AI coding agents."
        }
      ]);
    }, 1800);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    if (!rebuttals) return;
    const content = `CLAIM: ${claim}\n\n` + 
      rebuttals.map(r => `--- ${r.type.toUpperCase()} ---\n${r.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebuttals-${claim.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setClaim("Social media platforms should be completely banned for users under 16 because it ruins attention spans and increases anxiety.");
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          AI Counterargument Generator
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Input a controversial claim to generate multi-dimensional logical, ethical, and evidence-backed rebuttals.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Input */}
        <Card variant="glass" className="lg:col-span-1 flex flex-col justify-between" hoverEffect={false}>
          <form onSubmit={handleGenerate} className="space-y-4 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Enter Controversial Claim</label>
                <button
                  type="button"
                  onClick={loadExample}
                  className="text-xs font-bold text-indigo-650 dark:text-brand-400 hover:underline"
                >
                  Load Example
                </button>
              </div>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="Type the statement you want to generate rebuttals for..."
                className="w-full h-80 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isGenerating}
              disabled={!claim.trim() || claim.length < 15}
              className="w-full mt-4"
            >
              Generate Rebuttals
            </Button>
          </form>
        </Card>

        {/* Right Rebuttal Cards */}
        <div className="lg:col-span-2 space-y-6">
          {isGenerating ? (
            <Card variant="glass" className="p-12 text-center" hoverEffect={false}>
              <div className="max-w-md mx-auto py-12 flex flex-col items-center">
                <div className="h-14 w-14 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-6" />
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">Formulating Rebuttals...</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 max-w-xs leading-relaxed">
                  Analyzing opposing semantic datasets, drafting evidence-backed briefs, and structuring rebuttals...
                </p>
              </div>
            </Card>
          ) : rebuttals ? (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Generated 4 Rebuttal viewports</span>
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  size="sm" 
                  icon={IoDownload}
                >
                  Download All Rebuttals
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {rebuttals.map((r, idx) => {
                  const Icon = r.icon;
                  const isCopied = copiedIndex === idx;
                  return (
                    <Card key={idx} variant="glass" className="flex flex-col justify-between h-full border border-slate-200/50 dark:border-white/5" hoverEffect={true}>
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <span className={`text-xs font-bold font-display uppercase flex items-center gap-1.5 ${r.color}`}>
                            <Icon className="h-4.5 w-4.5" />
                            {r.type}
                          </span>
                          <button
                            onClick={() => handleCopy(r.text, idx)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-darkbg-accent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="Copy to clipboard"
                          >
                            {isCopied ? <IoCheckmarkDoneSharp className="h-4 w-4 text-emerald-500" /> : <IoCopy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">
                          {r.text}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setRebuttals(null)} variant="outline">
                  Clear & Generate New
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card variant="glass" className="text-center p-8 max-w-sm" hoverEffect={false}>
                <div className="p-4 bg-indigo-50 dark:bg-darkbg-accent text-indigo-500 dark:text-brand-400 rounded-2xl mb-4 inline-block">
                  <IoHelpCircle className="h-8 w-8" />
                </div>
                <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Awaiting Claims</h4>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                  Enter a controversial thesis claim on the left to review logical rebuttals and arguments.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounterargumentGenerator;
