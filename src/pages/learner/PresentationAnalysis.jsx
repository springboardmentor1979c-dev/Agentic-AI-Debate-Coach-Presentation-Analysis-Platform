import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  IoCloudUpload, IoMic, IoTrendingUp, IoAlertCircle, IoCheckmarkCircle, 
  IoSparkles, IoEye, IoBody, IoVolumeHigh, IoSpeedometer 
} from 'react-icons/io5';

const PresentationAnalysis = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        overallScore: 84,
        metrics: [
          { name: 'Speech Pace', value: 85, label: '135 WPM (Optimal)', icon: IoSpeedometer, color: 'bg-emerald-500' },
          { name: 'Clarity Index', value: 78, label: 'Good articulation', icon: IoTrendingUp, color: 'bg-blue-500' },
          { name: 'Engagement', value: 90, label: 'Excellent connection', icon: IoSparkles, color: 'bg-indigo-500' },
          { name: 'Body Language', value: 72, label: 'Gestures appropriate', icon: IoBody, color: 'bg-violet-500' },
          { name: 'Eye Contact', value: 80, label: 'Good room scanning', icon: IoEye, color: 'bg-purple-500' },
          { name: 'Voice Tone Range', value: 88, label: 'Dynamic Pitch variation', icon: IoVolumeHigh, color: 'bg-pink-500' },
        ],
        fillers: {
          total: 14,
          breakdown: [
            { word: 'uhm', count: 6 },
            { word: 'like', count: 4 },
            { word: 'basically', count: 2 },
            { word: 'you know', count: 2 },
          ]
        },
        paceTimeline: [
          { time: '0:00', wpm: 120 },
          { time: '1:00', wpm: 130 },
          { time: '2:00', wpm: 155 }, // Sped up a bit
          { time: '3:00', wpm: 140 },
          { time: '4:00', wpm: 132 },
          { time: '5:00', wpm: 135 },
        ],
        suggestions: [
          "In minute 2, your pacing accelerated to 155 WPM during the product overview. Take deliberate breaths between bullet points.",
          "You used the filler word 'uhm' 6 times, mostly during slide transitions. Practice pausing for 1 second instead of filling the space.",
          "Body language was solid, but try lowering your shoulders slightly to project more physical ease and authority."
        ]
      });
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          Presentation Speech Analysis
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload video, audio, or slide files to receive non-verbal pacing and articulation reviews.
          </p>
      </div>

      {!results && !isAnalyzing ? (
        /* Upload Area */
        <Card variant="glass" className="p-12 text-center" hoverEffect={false}>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-200 dark:border-darkbg-border rounded-[24px] p-10 bg-slate-50/25 dark:bg-darkbg-card/45 max-w-xl mx-auto flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 dark:hover:border-brand-700 transition-colors"
          >
            <div className="p-4 bg-indigo-50 dark:bg-darkbg-accent text-indigo-500 dark:text-brand-400 rounded-2xl mb-4">
              <IoCloudUpload className="h-10 w-10 animate-bounce" />
            </div>
            <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
              Drag & Drop file to upload
            </h4>
            <p className="text-xs text-slate-450 dark:text-slate-450 mt-1.5 mb-6">
              Supports MP4, MP3, PPT, PDF (Max size 100MB, 15 min duration limit)
            </p>
            <input
              type="file"
              id="file-selector"
              onChange={handleFileChange}
              className="hidden"
              accept=".mp4,.mp3,.ppt,.pptx,.pdf"
            />
            <label htmlFor="file-selector">
              <Button variant="secondary" size="sm" className="pointer-events-none">
                Browse Files
              </Button>
            </label>
            {file && (
              <p className="text-xs font-bold text-indigo-650 dark:text-brand-350 mt-4">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          {file && (
            <Button onClick={handleAnalyze} variant="primary" size="md" className="mt-8 px-10">
              Run AI Audio/Video Scan
            </Button>
          )}
        </Card>
      ) : isAnalyzing ? (
        /* Shimmer Loading Analysis */
        <Card variant="glass" className="p-12 text-center" hoverEffect={false}>
          <div className="max-w-md mx-auto py-12 flex flex-col items-center">
            {/* Spinning loader with gradient border */}
            <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-6" />
            <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">Analyzing Speech Dynamics...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-2 max-w-xs leading-relaxed">
              Evaluating speech rate frequencies, scanning facial tracking metrics, and mapping grammatical structuring logs...
            </p>
          </div>
        </Card>
      ) : (
        /* Results Section */
        <div className="space-y-8 animate-fadeIn">
          {/* Upper Header and Score */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card variant="deep" className="md:col-span-1 flex flex-col items-center justify-center text-center py-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Speech Rating</span>
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="40" stroke="url(#gradientScore)" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * results.overallScore) / 100}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradientScore" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-display font-black text-3xl text-slate-950 dark:text-white">
                  {results.overallScore}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/60 mt-4">
                Great Performance
              </span>
            </Card>

            {/* Metrics Breakdown Grid */}
            <Card variant="glass" className="md:col-span-3 grid sm:grid-cols-2 md:grid-cols-3 gap-6" hoverEffect={false}>
              {results.metrics.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 truncate">{m.name}</span>
                      <Icon className="h-4.5 w-4.5 text-indigo-500" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{m.value}%</span>
                      <div className="w-full bg-slate-150 dark:bg-darkbg-accent h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className={`h-full ${m.color}`} style={{ width: `${m.value}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-450 block mt-1 font-semibold">{m.label}</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Timeline and Filler Words Panel */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Speed Rate Timeline */}
            <Card variant="glass" className="md:col-span-2" hoverEffect={false}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Speed Pacing Timeline</h3>
                  <p className="text-[10px] text-slate-400">Words Per Minute (WPM) trend across duration</p>
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                  Target: 130-150 WPM
                </span>
              </div>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.paceTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#888888" tickLine={false} />
                    <YAxis stroke="#888888" tickLine={false} domain={[100, 180]} />
                    <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="wpm" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Filler Words Stats */}
            <Card variant="glass" hoverEffect={false}>
              <div className="mb-6">
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Filler Word Metrics</h3>
                <p className="text-[10px] text-slate-400">Total filler words flagged: <span className="font-bold text-rose-500">{results.fillers.total}</span></p>
              </div>

              <div className="space-y-4">
                {results.fillers.breakdown.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-350">"{f.word}"</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-slate-150 dark:bg-darkbg-accent h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${(f.count / results.fillers.total) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-250">{f.count} times</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Suggestions Card */}
          <Card variant="glass" className="border-l-4 border-l-indigo-600" hoverEffect={false}>
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
              <IoSparkles className="text-indigo-500 h-4.5 w-4.5" /> AI Feedback Recommendations
            </h3>
            <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-400">
              {results.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <IoCheckmarkCircle className="h-4.5 w-4.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Re-analyze Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setResults(null)} variant="outline">
              Clear & Upload New File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationAnalysis;
