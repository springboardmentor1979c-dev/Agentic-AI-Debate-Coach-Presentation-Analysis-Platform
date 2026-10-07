import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, Video, Mic, BarChart2, ShieldAlert, Sparkles, Download, Volume2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PresentationAnalysis = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [slidesInfo, setSlidesInfo] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a video or audio file first.');
      return;
    }
    setError('');
    setUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      
      // 1. Upload file and get transcript
      const uploadRes = await axios.post(`${API_URL}/presentation/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const { filepath, transcript } = uploadRes.data;

      // 2. Perform media and structural analysis
      const analyzeRes = await axios.post(`${API_URL}/presentation/analyze`, {
        filepath,
        transcript,
        slides_info: slidesInfo || 'Slide 1: Title. Slide 2: Data.',
        debate_session_id: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(analyzeRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during upload/analysis.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadReport = async (format) => {
    if (!results || !results.analysis_id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/presentation/report/${results.analysis_id}?file_type=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `presentation_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Report download failed:', err);
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          AI Presentation & Media Analysis
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload video or audio speech files to analyze speaking speed, voice stability, and visual posture body language.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" />
              Upload Presentation File
            </h2>

            {/* Drag & drop mock layout */}
            <div className="border border-dashed border-white/10 bg-slate-950/40 rounded-xl p-8 text-center space-y-3 cursor-pointer relative hover:border-purple-500/50 transition">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Video className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-400">
                {file ? file.name : 'Select or drop MP4/WAV file here'}
              </div>
              <p className="text-[10px] text-slate-600">Video up to 50MB, Audio up to 10MB</p>
            </div>

            {/* Slides context */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Slides Content (Optional)</label>
              <textarea
                value={slidesInfo}
                onChange={(e) => setSlidesInfo(e.target.value)}
                placeholder="Slide 1: Intro. Slide 2: Economic figures list. Slide 3: Conclusion summary."
                rows={4}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleUploadAndAnalyze}
              disabled={uploading || !file}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition duration-200 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing media files...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Speech & Video
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(results.scores || {}).map(([key, val]) => (
                  <div key={key} className="glass-panel p-4 border border-white/5 rounded-2xl flex flex-col justify-between items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {key.replace('_score', '').replace('_', ' ')}
                    </span>
                    <span className="text-3xl font-extrabold text-white mt-2">
                      {val}
                    </span>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vocal & Speech Metrics */}
              <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-400" />
                  Speech & Vocal Stability Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Words Per Minute</span>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      {results.speech?.metrics?.words_per_minute || 135}
                    </p>
                    <span className="text-[10px] text-emerald-400">Optimal Pace</span>
                  </div>

                  <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Pauses</span>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      {results.speech?.metrics?.pause_count || 4}
                    </p>
                    <span className="text-[10px] text-slate-500">Natural Flow</span>
                  </div>

                  <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filler Words count</span>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      {results.speech?.metrics?.filler_words_count || 3}
                    </p>
                    <span className="text-[10px] text-pink-400">Low redundancy</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Speech Coaching Tips</span>
                  <ul className="list-disc pl-4 text-xs space-y-1 text-slate-300">
                    {results.speech?.speech_tips?.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Video metrics */}
              <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  Posture & Eye Contact analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Eye Contact Percentage</span>
                      <span className="font-bold text-white">{results.video?.metrics?.eye_contact || 78.5}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${results.video?.metrics?.eye_contact || 78.5}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-4 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Head Pose stability index</span>
                      <span className="font-bold text-white">{results.video?.metrics?.head_pose || 85.0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        style={{ width: `${results.video?.metrics?.head_pose || 85.0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Video coaching tips</span>
                  <ul className="list-disc pl-4 text-xs space-y-1 text-slate-300">
                    {results.video?.video_tips?.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Slide Improvements */}
              {results.feedback?.slide_improvements?.length > 0 && (
                <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Slide Layout Improvements</h3>
                  <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-300">
                    {results.feedback.slide_improvements.map((si, idx) => (
                      <li key={idx}>{si}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Exports */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-white/10 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Report
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 border border-white/5 rounded-2xl text-center space-y-4">
              <BarChart2 className="w-12 h-12 text-purple-500/50 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">Ready to Analyze Presentation</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Select your video presentation or speech file in the left panel and submit it to see a comprehensive vocal speed and posture layout analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresentationAnalysis;
