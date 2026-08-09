import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, RefreshCw, Volume2, Sparkles, Activity } from 'lucide-react';

export default function SpeechRecorder({ onAnalyze }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState(
    "Um hello everyone. Uh today I like want to talk about um renewable energy policy and global climate transition. You know, empirical studies show that solar and wind power are actually 45 percent more cost-effective. However, some critics say we shouldn't transition because it is expensive, which is basically a false dilemma."
  );

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isRecording && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, timerSeconds]);

  const toggleRecording = () => {
    if (!isRecording) {
      setTimerSeconds(0);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  const handleAnalyzeClick = () => {
    onAnalyze(transcript, timerSeconds || 120);
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            Speech & Voice Recorder
          </h3>
          <p className="text-xs text-slate-400">Record audio directly or input transcript text for real-time speech analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg text-indigo-300 font-bold border border-slate-700">
            {formatTime(timerSeconds)}
          </span>
        </div>
      </div>

      {/* Audio Waveform Animation when Recording */}
      <div className="h-16 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 px-4 overflow-hidden relative">
        {isRecording ? (
          <>
            {[40, 75, 25, 90, 50, 80, 30, 95, 60, 85, 45, 70, 35, 90, 55, 80, 40, 65, 30, 85].map((h, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-full animate-pulse"
                style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
            <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> LIVE RECORDING
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" /> Press record or edit the transcript below to start analysis
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggleRecording}
          className={`flex-1 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            isRecording 
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isRecording ? 'Stop Recording' : 'Start Speech Recording'}
        </button>

        <button
          onClick={handleAnalyzeClick}
          className="gradient-btn px-6 py-3 rounded-2xl font-bold text-xs text-white shadow-lg flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          Run Speech Analytics
        </button>
      </div>

      {/* Transcript Textarea */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Speech Transcript Text:</label>
        <textarea
          rows={4}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          placeholder="Paste or type presentation transcript here..."
        />
      </div>
    </div>
  );
}
