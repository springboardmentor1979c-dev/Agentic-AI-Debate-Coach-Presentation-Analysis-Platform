import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, BarChart2, ShieldAlert, Sparkles, BookOpen, Download, List } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ArgumentAnalysis = () => {
  const [text, setText] = useState('');
  const [sessionSelected, setSessionSelected] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDebates();
  }, []);

  const fetchDebates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/debates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data);
      if (response.data.length > 0) {
        setSessionSelected(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching debates:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please provide some argument text to analyze.');
      return;
    }
    if (!sessionSelected) {
      setError('Please select or create a debate session context first.');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/analyze`, {
        text: text,
        debate_session_id: parseInt(sessionSelected)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!results) return;
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/export/${format}`, {
        scores: results.scores,
        fallacies: results.fallacies,
        feedback: results.feedback,
        improved: results.improved
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `argument_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Argument Analysis Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Extract claims, evaluate reasoning flow, detect logical fallacies, and optimize debate structure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-purple-300">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Argument Input
            </h2>
            
            {/* Session select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Debate Context</label>
              <select
                value={sessionSelected}
                onChange={(e) => setSessionSelected(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition duration-200"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.format})
                  </option>
                ))}
              </select>
            </div>

            {/* Argument text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Argument Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your debate speech transcript or written argument here..."
                rows={10}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition duration-200 resize-none font-sans"
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-950/50 hover:shadow-purple-950/20 active:scale-98 transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing logic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Argument
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Scores Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(results.scores || {}).map(([key, val]) => (
                  <div key={key} className="glass-panel p-4 border border-white/5 rounded-2xl flex flex-col justify-between items-center text-center relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-purple-950/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-3xl font-extrabold text-white mt-2">
                      {val}
                    </span>
                    {/* Visual bar tracker */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Claims & Structure */}
              <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Extracted Claims & Logic Structure
                </h3>
                <div className="space-y-3">
                  <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Main Claim</span>
                    <p className="text-sm font-medium text-white">{results.claims?.main_claim?.text || text.slice(0, 100)}</p>
                    <span className="text-[10px] text-slate-500">Confidence score: {results.claims?.main_claim?.confidence}</span>
                  </div>
                  
                  {results.claims?.supporting_claims?.length > 0 && (
                    <div className="bg-slate-900/20 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Supporting Claims</span>
                      <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-300">
                        {results.claims.supporting_claims.map((sc, i) => (
                          <li key={i}>{sc.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.claims?.counter_claims?.length > 0 && (
                    <div className="bg-slate-900/20 p-4 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-pink-400 uppercase tracking-wider">Addressed Counter Claims</span>
                      <ul className="list-disc pl-4 text-xs space-y-1.5 text-slate-300">
                        {results.claims.counter_claims.map((cc, i) => (
                          <li key={i}>{cc.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Logical Fallacies */}
              <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-pink-300 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-pink-400" />
                  Detected Logical Fallacies
                </h3>
                {results.fallacies?.length > 0 ? (
                  <div className="space-y-4">
                    {results.fallacies.map((f, i) => (
                      <div key={i} className="border border-white/5 bg-slate-950/30 p-4 rounded-xl space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-pink-400">{f.fallacy_type}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            f.severity.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            f.severity.toLowerCase() === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {f.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs text-slate-300"><span className="font-semibold text-slate-400">Description:</span> {f.description}</p>
                        {f.highlighted_sentence && (
                          <div className="bg-pink-950/10 border-l-2 border-pink-500/50 p-2.5 rounded-r-lg text-xs italic text-pink-200">
                            "{f.highlighted_sentence}"
                          </div>
                        )}
                        {f.correction && (
                          <p className="text-xs text-emerald-400"><span className="font-semibold text-slate-400">Correction:</span> {f.correction}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl text-center text-emerald-300 text-xs">
                    No logical fallacies detected. Excellent reasoning consistency!
                  </div>
                )}
              </div>

              {/* Improved Argument */}
              <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4 bg-gradient-to-br from-slate-900/60 to-blue-950/20">
                <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                  AI Re-structured Argument
                </h3>
                <p className="text-sm bg-slate-950/50 p-4 border border-white/5 rounded-xl text-slate-200 leading-relaxed font-sans shadow-inner">
                  {results.improved?.improved_argument}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/50 p-3 rounded-xl">
                    <span className="font-bold text-blue-400 block mb-1">Wording Tip</span>
                    <p className="text-slate-300">{results.improved?.wording_tips}</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl">
                    <span className="font-bold text-purple-400 block mb-1">Structural Tip</span>
                    <p className="text-slate-300">{results.improved?.structural_tips}</p>
                  </div>
                </div>
              </div>

              {/* Action Exports */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-white/10 transition"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-white/10 transition"
                >
                  <List className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 border border-white/5 rounded-2xl text-center space-y-4">
              <BarChart2 className="w-12 h-12 text-purple-500/50 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">Ready to Analyze</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Provide your argument text in the input panel and click "Analyze Argument" to observe deep structural and logical fallacies reviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArgumentAnalysis;
