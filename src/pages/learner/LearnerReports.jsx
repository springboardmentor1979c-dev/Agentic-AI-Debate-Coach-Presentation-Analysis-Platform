import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import { IoDownload, IoSparkles, IoStatsChart, IoDocumentText } from 'react-icons/io5';

const LearnerReports = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mock data
  const reportsList = [
    { name: "Monthly Performance Review (July)", date: "Jul 29, 2026", size: "1.4 MB", type: "PDF" },
    { name: "Debate Sparring Logs Export", date: "Jul 27, 2026", size: "320 KB", type: "Excel" },
    { name: "Filler Words Frequencies List", date: "Jul 20, 2026", size: "15 KB", type: "CSV" },
  ];

  const barData = [
    { name: 'Debate Refutation', score: 85 },
    { name: 'Pace Speed', score: 78 },
    { name: 'Logic Consistency', score: 90 },
    { name: 'Volume Range', score: 72 },
    { name: 'Body Language', score: 80 },
  ];

  const handleExport = (format) => {
    setIsExporting(true);
    setToastMsg(`Preparing your data logs. Generating ${format} file...`);
    setToastVisible(true);
    
    setTimeout(() => {
      setIsExporting(false);
      setToastMsg(`Download Complete! debateiq_report_${format.toLowerCase() === 'excel' ? 'logs.xlsx' : 'analytics.pdf'} saved to downloads.`);
      setToastVisible(true);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Performance Reports & Logs
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and export overall speaker logs, argument reviews, and statistical charts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('PDF')} variant="secondary" size="sm" icon={IoDownload}>
            Export PDF
          </Button>
          <Button onClick={() => handleExport('Excel')} variant="primary" size="sm" icon={IoDownload}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Analytics Growth chart */}
        <Card variant="glass" className="md:col-span-2" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Competency Ratings</h3>
              <p className="text-[10px] text-slate-450">Individual score indexes on speech dimensions</p>
            </div>
            <IoStatsChart className="text-indigo-500" />
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis stroke="#888888" tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Existing Exports */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Recent Exports</h3>
            <p className="text-[10px] text-slate-450">Previously compiled report files</p>
          </div>

          <div className="space-y-4">
            {reportsList.map((rep, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/40 dark:bg-darkbg-accent/30 border border-slate-100 dark:border-darkbg-border/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{rep.name}</h4>
                  <span className="text-[9px] text-slate-450 font-semibold">{rep.date} • {rep.size}</span>
                </div>
                <button
                  onClick={() => handleExport(rep.type)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-darkbg-accent dark:hover:bg-brand-950 text-indigo-500 dark:text-brand-300"
                >
                  <IoDownload className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Detailed stats summary card */}
      <Card variant="glass" hoverEffect={false}>
        <div className="mb-6">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
            Performance Summary Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-bold border-b border-slate-200/50 dark:border-darkbg-border pb-3">
                <th className="pb-3">Dimension Category</th>
                <th className="pb-3">Rating Score</th>
                <th className="pb-3">Stance Accuracy</th>
                <th className="pb-3">Status Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border">
              {[
                { name: "Oxford debating sparring", score: "88/100", precision: "High Stance", status: "Optimal" },
                { name: "Logical fallacy detections", score: "92/100", precision: "Zero circular flags", status: "Excellent" },
                { name: "Speech pace stability", score: "78/100", precision: "135 WPM average", status: "Needs practice" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-darkbg-accent/10">
                  <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                  <td className="py-4 font-semibold text-indigo-650 dark:text-brand-350">{row.score}</td>
                  <td className="py-4 text-slate-500">{row.precision}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                      row.status === "Needs practice" 
                        ? 'bg-rose-50 dark:bg-rose-950/25 text-rose-500' 
                        : 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-500'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Toast 
        message={toastMsg} 
        type={isExporting ? "info" : "success"} 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </div>
  );
};

export default LearnerReports;
