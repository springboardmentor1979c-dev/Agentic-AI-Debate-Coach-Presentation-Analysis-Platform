'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "http://127.0.0.1:8000";

export default function Home() {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'overview' | 'practice' | 'leaderboard' | 'library'>('overview');
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [authMsg, setAuthMsg] = useState<{text: string, type: 'err'|'ok'}|null>(null);

  const [loginEmail, setLoginEmail] = useState('sample.user@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Learner');

  const [topic, setTopic] = useState('');
  const [argument, setArgument] = useState('');
  const [interimText, setInterimText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Educator States
  const [educatorTopic, setEducatorTopic] = useState('');
  const [assignedTopics, setAssignedTopics] = useState<string[]>(['Universal Basic Income']);
  const [completedTopics, setCompletedTopics] = useState<string[]>(['Nuclear Energy Policies']);
  const [assignSuccess, setAssignSuccess] = useState(false);
  
  // Library Resource States
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [resourcePage, setResourcePage] = useState(1);
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Web Audio API refs & Speech Recognition
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('dc_token');
    if (t) {
      setToken(t);
      loadUser(t);
    }
  }, []);

  const loadUser = async (t: string) => {
    try {
      const res = await fetch(`${API_BASE}/me`, { headers: { 'Authorization': `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser({ name: data.name, role: data.role });
        setView('app');
      } else handleLogout();
    } catch (e) { handleLogout(); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    const body = new URLSearchParams();
    body.set('username', loginEmail);
    body.set('password', loginPassword);
    try {
      const res = await fetch(`${API_BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      setToken(data.access_token);
      localStorage.setItem('dc_token', data.access_token);
      loadUser(data.access_token);
    } catch (err: any) { setAuthMsg({ text: err.message, type: 'err' }); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg(null);
    try {
      const res = await fetch(`${API_BASE}/register`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole }) 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      setAuthMsg({ text: 'Account created! Signing in...', type: 'ok' });
      setLoginEmail(regEmail); setLoginPassword(regPassword);
      setTimeout(() => setAuthMode('login'), 1000);
    } catch (err: any) { setAuthMsg({ text: err.message, type: 'err' }); }
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('dc_token');
    setView('landing');
  };

  // --- RECORDING & LIVE TRANSCRIPTION ---
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsRecording(false);
      setInterimText('');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup MediaRecorder for backend upload (Speech Analytics)
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await uploadAudioForPresentationAnalytics(audioBlob);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
        setInterimText('');

        // LIVE SPEECH-TO-TEXT (Web Speech API)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
            let final = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            if (final) {
               setArgument(prev => prev + (prev ? ' ' : '') + final);
            }
            setInterimText(interim);
          };
          recognition.start();
          recognitionRef.current = recognition;
        }

        // REAL-TIME PULSATING ANIMATION ON THE CSS RING + SMOOTH COLORFUL SINE WAVES
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
        
        let phase = 0;

        const drawWaveform = () => {
          if (!analyserRef.current || !orbContainerRef.current || !canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate overall volume
          let sum = 0;
          for(let i=0; i<bufferLength; i++) sum += dataArray[i];
          const volume = sum / bufferLength; // 0 to 255
          
          // Base scale expands based on audio volume
          const scale = 1 + (volume / 200); 
          orbContainerRef.current.style.transform = `scale(${scale})`;

          // Draw smooth colorful ribbon waves
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Phase controls wave speed (moves faster when louder)
          phase += 0.04 + (volume / 800);
          
          // Amplitude controls wave height (taller when louder)
          const amplitudeBase = 4 + (volume * 0.4); 

          const drawSineWave = (color: string, amplitudeMult: number, phaseOffset: number, frequency: number, lineWidth: number) => {
             ctx.beginPath();
             ctx.moveTo(0, canvas.height / 2);
             
             for (let x = 0; x <= canvas.width; x += 2) {
                // Taper the ends so the waves fade nicely into the edges of the circle
                const xNorm = x / canvas.width;
                const taper = Math.sin(xNorm * Math.PI); 
                
                const y = (canvas.height / 2) + Math.sin((xNorm * frequency) + phase + phaseOffset) * (amplitudeBase * amplitudeMult * taper);
                ctx.lineTo(x, y);
             }
             
             ctx.strokeStyle = color;
             ctx.lineWidth = lineWidth;
             ctx.shadowBlur = 8;
             ctx.shadowColor = color;
             ctx.stroke();
          };

          // Blue, Purple, Pink, White overlapping waves matching the exact colors of the outer CSS orb
          drawSineWave('#1e25e8', 1.0, 0, Math.PI * 2, 2.5);         // Deep Blue
          drawSineWave('#b052ff', 0.8, Math.PI / 4, Math.PI * 2.5, 2); // Neon Purple
          drawSineWave('#ffa3d4', 0.6, Math.PI / 2, Math.PI * 3, 1.5); // Soft Pink
          drawSineWave('#ffffff', 1.2, Math.PI, Math.PI * 1.5, 1);     // Bright White Core

          animationRef.current = requestAnimationFrame(drawWaveform);
        };
        drawWaveform();

      } catch (err) {
        alert("Microphone access denied or not supported.");
      }
    }
  };

  const uploadAudioForPresentationAnalytics = async (audioBlob: Blob) => {
    if (!token) return;
    setIsTranscribing(true);
    try {
      const fullTranscript = argument + " " + interimText;
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('transcript', fullTranscript);
      
      const res = await fetch(`${API_BASE}/presentation/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const speechData = await res.json();
      setSpeechAnalysis(speechData.presentation_analysis);
      
      // If this was an active assignment, mark it as completed!
      if (assignedTopics.includes(topic)) {
         setAssignedTopics(prev => prev.filter(t => t !== topic));
         if (!completedTopics.includes(topic)) {
            setCompletedTopics(prev => [topic, ...prev]);
         }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDebateAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true); setAnalysis(null);
    try {
      const res = await fetch(`${API_BASE}/practice/sessions/test_session/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic, argument_text: argument + ' ' + interimText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Analysis failed');
      setAnalysis({
        feedback: data.analysis_preview.feedback || "Your argument structure is solid.",
        claim: data.analysis_preview.claim_score,
        evidence: data.analysis_preview.evidence_score,
        rebuttal: data.analysis_preview.rebuttal_score,
        verdict: data.analysis_preview.verdict_score,
        fallacies: data.fallacies_detected || []
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reports/export/session_123/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Debate_Coach_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to download PDF.");
    }
  };

  const handleAssignTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!educatorTopic.trim()) return;
    setAssignedTopics(prev => [educatorTopic, ...prev]);
    setEducatorTopic('');
    setAssignSuccess(true);
    setTimeout(() => setAssignSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-40 flex items-center justify-between py-5 px-[6vw] bg-[#0B0E1Acc] backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 font-serif text-[19px]">
          <span className="w-[26px] h-[26px] [perspective:200px]">
            <span className="w-full h-full relative [transform-style:preserve-3d] brand-mark-inner block">
              <span className="absolute inset-0 bg-gradient-to-br from-[#8B7CFF] to-[#C9A227] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]"></span>
              <span className="absolute inset-0 bg-gradient-to-br from-[#8B7CFF] to-[#C9A227] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] [transform:rotateY(180deg)]"></span>
            </span>
          </span>
          Debate Coach
        </div>
        
        {view === 'app' && (
          <div className="hidden md:flex gap-8 text-sm text-[#7C87AC]">
            <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'text-[#F2ECDD] font-medium border-b border-[#C9A227] pb-1' : 'hover:text-[#F2ECDD] transition'}>Dashboard</button>
            <button onClick={() => setActiveTab('practice')} className={activeTab === 'practice' ? 'text-[#F2ECDD] font-medium border-b border-[#C9A227] pb-1' : 'hover:text-[#F2ECDD] transition'}>Practice Debates</button>
            <button onClick={() => setActiveTab('leaderboard')} className={activeTab === 'leaderboard' ? 'text-[#F2ECDD] font-medium border-b border-[#C9A227] pb-1' : 'hover:text-[#F2ECDD] transition'}>Leaderboard</button>
            <button onClick={() => setActiveTab('library')} className={activeTab === 'library' ? 'text-[#F2ECDD] font-medium border-b border-[#C9A227] pb-1' : 'hover:text-[#F2ECDD] transition'}>Resource Library</button>
          </div>
        )}

        <button 
          onClick={() => { if (view === 'app') handleLogout(); else { setView('auth'); setAuthMode('login'); } }} 
          className="bg-transparent border border-[#C9A22766] text-[#F2ECDD] px-[18px] py-[9px] rounded-full text-sm transition hover:border-[#C9A227] hover:bg-[#C9A22715]"
        >
          {view === 'app' ? 'Sign out' : 'Sign in'}
        </button>
      </nav>

      {/* --- LANDING VIEW --- */}
      {view === 'landing' && (
        <section className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] items-center min-h-[86vh] gap-10 pt-[4vh] px-[6vw]">
          <div>
            <p className="eyebrow">Agentic AI Debate Coach & Presentation Analysis</p>
            <h1 className="text-[clamp(40px,5.2vw,72px)] leading-[1.02]">Argue with <em className="italic text-[#8B7CFF]">structure.</em><br/>Speak with <em className="italic text-[#8B7CFF]">conviction.</em></h1>
            <p className="text-[#7C87AC] text-[18px] leading-[1.6] max-w-[46ch] mt-[22px] mb-[34px]">
              A practice ground for debaters, coaches, and classrooms — built around one idea: every strong argument turns on the same four faces.
            </p>
            <div className="flex gap-[14px]">
              <button onClick={() => { setView('auth'); setAuthMode('register'); }} className="px-[26px] py-[14px] rounded-full text-[15px] font-medium border-none bg-[#C9A227] text-[#1A1400] transition hover:bg-[#DDB335]">
                Create an account
              </button>
            </div>
          </div>
          <div>
            <div className="cube-stage">
              <div className="cube">
                <div className="cube-face f-front"><span className="num">01</span><span className="word">Claim</span></div>
                <div className="cube-face f-right"><span className="num">02</span><span className="word">Evidence</span></div>
                <div className="cube-face f-back"><span className="num">03</span><span className="word">Rebuttal</span></div>
                <div className="cube-face f-left"><span className="num">04</span><span className="word">Verdict</span></div>
              </div>
            </div>
            <div className="cube-ground"></div>
          </div>
        </section>
      )}

      {/* --- AUTH VIEW --- */}
      {view === 'auth' && (
        <section className="flex min-h-[90vh] items-center justify-center px-[6vw]">
          <div className="w-[420px] max-w-[92vw] [perspective:1600px]">
            <div className={`relative w-full min-h-[480px] [transform-style:preserve-3d] transition-transform duration-700 ${authMode==='register' ? '[transform:rotateY(180deg)]' : ''}`}>
              <div className="absolute inset-0 [backface-visibility:hidden] bg-[#141A2E] border border-white/10 border-t-2 border-t-[#C9A227] rounded-[18px] p-[38px_34px]">
                <h2 className="text-[26px] mb-2">Sign in</h2>
                <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
                  <div>
                    <label className="text-[12px] text-[#7C87AC] uppercase tracking-[.08em] block mb-1">Email</label>
                    <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-3 rounded-lg text-sm focus:border-[#8B7CFF]" />
                  </div>
                  <div>
                    <label className="text-[12px] text-[#7C87AC] uppercase tracking-[.08em] block mb-1">Password</label>
                    <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-3 rounded-lg text-sm focus:border-[#8B7CFF]" />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-full border-none bg-[#8B7CFF] text-[#0B0E1A] font-semibold text-[15px] transition hover:bg-[#A297FF] mt-2">Sign in</button>
                  {authMsg && <div className={`text-sm p-3 rounded-lg ${authMsg.type === 'err' ? 'bg-[#E4667A1a] text-[#E4667A]' : 'bg-[#6FD3A61a] text-[#6FD3A6]'}`}>{authMsg.text}</div>}
                </form>
                <p className="text-center mt-5 text-[13px] text-[#7C87AC]">New here? <button onClick={()=>setAuthMode('register')} className="text-[#C9A227] underline">Create an account</button></p>
              </div>

              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#141A2E] border border-white/10 border-t-2 border-t-[#C9A227] rounded-[18px] p-[38px_34px]">
                <h2 className="text-[26px] mb-2">Create account</h2>
                <form onSubmit={handleRegister} className="flex flex-col gap-3 mt-4">
                  <input type="text" placeholder="Name" value={regName} onChange={e=>setRegName(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 p-2 rounded-lg text-sm" />
                  <input type="email" placeholder="Email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 p-2 rounded-lg text-sm" />
                  <input type="password" placeholder="Password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 p-2 rounded-lg text-sm" />
                  
                  <select 
                    value={regRole} 
                    onChange={e=>setRegRole(e.target.value)} 
                    className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-2 rounded-lg text-sm focus:border-[#8B7CFF]"
                  >
                    <option value="Learner">Learner</option>
                    <option value="Coach">Coach</option>
                    <option value="Educator">Educator</option>
                    <option value="Admin">Admin</option>
                  </select>

                  <button type="submit" className="w-full py-3 rounded-full bg-[#8B7CFF] text-[#0B0E1A] font-semibold mt-2">Create account</button>
                  {authMsg && <div className="text-sm p-3 rounded-lg bg-[#E4667A1a] text-[#E4667A]">{authMsg.text}</div>}
                </form>
                <p className="text-center mt-4 text-[13px] text-[#7C87AC]">Already registered? <button onClick={()=>setAuthMode('login')} className="text-[#C9A227] underline">Sign in</button></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- APP DASHBOARD VIEW --- */}
      {view === 'app' && user && (
        <section className="min-h-screen py-[50px] px-[6vw] pb-[100px]">
          <div className="flex justify-between items-end mb-[36px] flex-wrap gap-[16px]">
            <div>
              <p className="eyebrow">User Profile</p>
              <h2 className="text-[13px] text-[#7C87AC]">Signed in as <b className="text-[#F2ECDD] text-lg">{user.name}</b></h2>
            </div>
            <div className="flex items-center gap-[14px]">
               <span className="font-mono text-[11px] tracking-[.08em] bg-[#8B7CFF1f] text-[#8B7CFF] border border-[#8B7CFF44] px-[10px] py-[4px] rounded-full uppercase">
                 {user.role}
               </span>
            </div>
          </div>

          {/* LEARNER OVERVIEW TAB */}
          {user.role === 'Learner' && activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="tilt-card col-span-1 md:col-span-2 flex flex-col gap-4">
                  <h3 className="text-[19px]">Performance Overview</h3>
                  
                  <div className="flex flex-col md:flex-row gap-8 items-center bg-[#0B0E1A] p-6 rounded-lg border border-white/5">
                     
                     <div className="relative w-[180px] h-[180px]">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(139,124,255,0.4)]">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#141A2E" strokeWidth="12" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#gradient)" strokeWidth="12" 
                                  strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" 
                                  className="transition-all duration-1000 ease-out" />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8B7CFF" />
                              <stop offset="100%" stopColor="#C9A227" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-serif text-[#F2ECDD]">75<span className="text-sm">%</span></span>
                           <span className="text-[10px] text-[#7C87AC] uppercase tracking-widest mt-1">Overall</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 flex-1 w-full">
                       <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-sm text-[#7C87AC]">Total Practice Time</span>
                         <span className="font-mono text-[#F2ECDD]">12h 45m</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-sm text-[#7C87AC]">Debates Completed</span>
                         <span className="font-mono text-[#F2ECDD]">24</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-white/10 pb-2">
                         <span className="text-sm text-[#7C87AC]">Global Ranking</span>
                         <span className="font-mono text-[#F2ECDD]">Top 15%</span>
                       </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-[#0B0E1A] border border-[#6FD3A633] p-5 rounded-lg shadow-[0_0_20px_#6FD3A60a]">
                      <h4 className="text-[#6FD3A6] mb-3 text-sm font-semibold uppercase tracking-wider">Key Strengths</h4>
                      <ul className="text-[#7C87AC] text-[13px] space-y-2 list-disc pl-4 m-0">
                        <li>Excellent use of cited Evidence</li>
                        <li>High Confidence & Speech Clarity</li>
                        <li>Strong structural organization</li>
                      </ul>
                    </div>
                    <div className="bg-[#0B0E1A] border border-[#E4667A33] p-5 rounded-lg shadow-[0_0_20px_#E4667A0a]">
                      <h4 className="text-[#E4667A] mb-3 text-sm font-semibold uppercase tracking-wider">Areas to Improve</h4>
                      <ul className="text-[#7C87AC] text-[13px] space-y-2 list-disc pl-4 m-0">
                        <li>Anticipating counter-arguments</li>
                        <li>Reducing filler words</li>
                        <li>Strengthening the final Verdict</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="tilt-card col-span-1">
                  <h3 className="text-[19px] mb-[16px]">Activity Graph</h3>
                  
                  <div className="w-full h-[150px] mb-6 relative bg-[#0B0E1A] rounded-lg border border-white/5 p-4 overflow-hidden">
                     <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        <defs>
                           <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B7CFF" stopOpacity="0.5"/>
                              <stop offset="100%" stopColor="#8B7CFF" stopOpacity="0.0"/>
                           </linearGradient>
                        </defs>
                        <path d="M 0,35 C 20,35 20,25 40,25 C 60,25 60,10 80,15 C 90,17.5 95,5 100,5 L 100,40 L 0,40 Z" fill="url(#lineGrad)" />
                        <path d="M 0,35 C 20,35 20,25 40,25 C 60,25 60,10 80,15 C 90,17.5 95,5 100,5" fill="none" stroke="#8B7CFF" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="40" cy="25" r="1.5" fill="#C9A227" className="animate-pulse" />
                        <circle cx="80" cy="15" r="1.5" fill="#C9A227" className="animate-pulse" />
                        <circle cx="100" cy="5" r="1.5" fill="#C9A227" className="animate-pulse" />
                     </svg>
                  </div>

                  <div className="flex flex-col gap-4">
                     <div className="bg-[#0B0E1A] p-4 rounded-lg border border-white/5 border-l-2 border-l-[#8B7CFF]">
                       <span className="text-[10px] text-[#7C87AC] font-mono tracking-wider block mb-1">TODAY</span>
                       <h5 className="text-[#F2ECDD] m-0 text-sm">Universal Basic Income</h5>
                       <p className="text-xs text-[#7C87AC] mt-1 m-0">Score: 82/100 • 5 mins practice</p>
                     </div>
                     <div className="bg-[#0B0E1A] p-4 rounded-lg border border-white/5 border-l-2 border-l-[#C9A227]">
                       <span className="text-[10px] text-[#7C87AC] font-mono tracking-wider block mb-1">YESTERDAY</span>
                       <h5 className="text-[#F2ECDD] m-0 text-sm">Nuclear Energy Policies</h5>
                       <p className="text-xs text-[#7C87AC] mt-1 m-0">Score: 74/100 • 12 mins practice</p>
                     </div>
                  </div>
                  <button onClick={() => setActiveTab('practice')} className="w-full mt-6 py-2.5 rounded-full bg-[#8B7CFF11] border border-[#8B7CFF33] text-sm text-[#8B7CFF] hover:bg-[#8B7CFF33] transition">Start New Debate</button>
                </div>
             </div>
          )}

          {/* PRACTICE TAB (Available to all roles) */}
          {activeTab === 'practice' && (
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-[26px] items-start animate-[fadeIn_0.4s_ease-out]">
              <div className="tilt-card col-span-1 md:col-span-2">
                <div className="flex justify-between items-center mb-[16px]">
                  <h3 className="text-[19px] m-0">Practice Session: AI Coach</h3>
                  {analysis && (
                    <button onClick={handleDownloadPDF} className="text-xs bg-[#C9A22722] text-[#C9A227] border border-[#C9A227] px-4 py-2 rounded-full hover:bg-[#C9A22744] transition flex items-center gap-2 uppercase tracking-wider font-semibold">
                      Download PDF Report
                    </button>
                  )}
                </div>
                <p className="text-[#7C87AC] text-[13px] mt-[-8px] mb-[24px]">Draft your argument manually or use the microphone for real-time speech analysis.</p>
                
                <form onSubmit={handleDebateAnalyze} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[12px] text-[#7C87AC] uppercase tracking-[.08em] block mb-2">Debate Topic</label>
                    <input type="text" value={topic} onChange={e=>setTopic(e.target.value)} required className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-3 rounded-lg text-sm focus:border-[#8B7CFF] transition" placeholder="e.g. Universal Basic Income" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[12px] text-[#7C87AC] uppercase tracking-[.08em] block">Your Argument</label>
                      <button 
                        type="button" 
                        onClick={handleToggleRecording}
                        className={`text-xs px-4 py-2 rounded-full border transition flex items-center gap-2 font-semibold uppercase tracking-wider ${isRecording ? 'bg-[#E4667A] text-[#141A2E] border-[#E4667A] shadow-[0_0_15px_#E4667A]' : 'bg-[#0B0E1A] text-[#E4667A] border-[#E4667A55] hover:border-[#E4667A]'}`}
                      >
                        {isRecording ? 'Stop Recording' : 'Record Audio'}
                      </button>
                    </div>

                    {/* EXACT CSS REPLICA ORB + REAL-TIME COLORFUL SINE WAVES OVERLAY */}
                    <div className={`w-full bg-black border border-[#8B7CFF44] rounded-lg flex items-center justify-center overflow-hidden relative shadow-[inset_0_0_80px_#000] transition-all duration-300 ${isRecording ? 'h-[240px] opacity-100 mb-3' : 'h-0 opacity-0 mb-0 border-0'}`}>
                         
                         {/* Unified Container: Both the CSS Ring and the Canvas waves will pulsate and scale together! */}
                         <div ref={orbContainerRef} className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75">
                             
                             {/* The exact glowing ring from the user's image */}
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <div className="relative w-[150px] h-[150px] animate-[spinMark_3s_linear_infinite]">
                                  <div className="absolute inset-[-10px] rounded-full border-[10px] border-[#1e25e8] opacity-80 blur-[8px]"></div>
                                  <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-[#b052ff] border-r-[#b052ff] opacity-90 blur-[2px] [transform:rotate(45deg)] shadow-[0_0_20px_#b052ff]"></div>
                                  <div className="absolute inset-[-5px] rounded-full border-[3px] border-transparent border-b-[#ffa3d4] opacity-70 blur-[3px] [transform:rotate(-30deg)] shadow-[0_0_15px_#ffa3d4]"></div>
                                  <div className="absolute inset-[2px] rounded-full border-[1.5px] border-white/60 blur-[1px]"></div>
                               </div>
                             </div>
                             
                             {/* The smooth colorful ribbon waves canvas inside the ring */}
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <canvas ref={canvasRef} width="120" height="120" className="w-[120px] h-[120px] z-10"></canvas>
                             </div>
                             
                         </div>
                         
                         <div className="absolute bottom-4 left-0 w-full text-center text-[#b052ff] text-[10px] font-mono tracking-[0.2em] animate-pulse">LISTENING TO YOUR VOICE...</div>
                    </div>

                    <textarea value={argument + (interimText ? " " + interimText : "")} onChange={e=>setArgument(e.target.value)} required rows={5} className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-3 rounded-lg text-sm focus:border-[#8B7CFF] transition mt-2" placeholder={isTranscribing ? "Transcribing audio..." : "State your claim, provide evidence..."}></textarea>
                  </div>
                  <button disabled={loading || isTranscribing} type="submit" className="w-full py-3 rounded-full bg-[#8B7CFF] text-[#0B0E1A] font-semibold text-[15px] transition hover:bg-[#A297FF] mt-2 disabled:opacity-50 tracking-wide">
                    {loading ? 'Analyzing...' : 'Analyze Argument'}
                  </button>
                </form>

                {analysis && (
                  <div className="mt-8 border-t border-white/10 pt-6">
                     <h4 className="font-serif text-[20px] mb-3 text-[#C9A227]">Coach Feedback</h4>
                     <p className="text-sm mb-6 leading-relaxed">{analysis.feedback}</p>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {[
                         {name: 'Claim', sc: analysis.claim},
                         {name: 'Evidence', sc: analysis.evidence},
                         {name: 'Rebuttal', sc: analysis.rebuttal},
                         {name: 'Verdict', sc: analysis.verdict},
                       ].map(a => (
                         <div key={a.name} className="bg-[#0B0E1A] border border-white/10 rounded-lg p-4 flex flex-col items-center gap-3">
                           <span className="text-[11px] uppercase tracking-widest text-[#7C87AC]">{a.name}</span>
                           <span className={`font-mono text-lg font-bold px-3 py-1 rounded border ${a.sc >= 70 ? 'bg-[#6FD3A61f] text-[#6FD3A6] border-[#6FD3A644]' : 'bg-[#E4667A1f] text-[#E4667A] border-[#E4667A44]'}`}>
                             {a.sc}/100
                           </span>
                         </div>
                       ))}
                     </div>
                     
                     {analysis.fallacies && analysis.fallacies.length > 0 && (
                       <div className="mt-6 p-5 bg-[#E4667A1a] border border-[#E4667A44] rounded-lg text-[13px] text-[#E4667A]">
                         <strong className="block text-sm uppercase tracking-wider mb-2">Logical Fallacies Detected</strong>
                         <ul className="list-disc pl-5 m-0 space-y-1">
                           {analysis.fallacies.map((f:string) => <li key={f}>{f}</li>)}
                         </ul>
                       </div>
                     )}
                     
                     <div className="mt-6 p-5 bg-[#8B7CFF11] border border-[#8B7CFF44] rounded-lg text-[13px] text-[#8B7CFF]">
                         <strong className="block text-sm uppercase tracking-wider mb-2">AI Counter-Argument</strong>
                         <p className="m-0 text-[#7C87AC] leading-relaxed">Based on your claim, a strong opponent would argue that you lack sufficient data regarding economic inflation. Consider addressing this in your Rebuttal phase.</p>
                     </div>
                  </div>
                )}
                
                {speechAnalysis && (
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <h4 className="font-serif text-[20px] mb-6 text-[#8B7CFF]">Speech Analytics</h4>
                    
                    {/* DYNAMIC FEEDBACK TEXT GENERATED BY BACKEND */}
                    <div className="mb-6 p-5 bg-[#0B0E1A] border-l-4 border-[#8B7CFF] rounded-r-lg shadow-sm">
                       <p className="text-sm text-[#F2ECDD] m-0 leading-relaxed italic">
                         "{speechAnalysis.feedback}"
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 items-center">
                      <div className="flex flex-col gap-3">
                         <div className="flex justify-between items-center bg-[#0B0E1A] p-4 rounded-lg border border-white/5">
                           <span className="text-[#7C87AC] text-xs uppercase tracking-wider">Speech Speed</span>
                           <span className="font-mono text-[#F2ECDD] font-bold">{speechAnalysis.speech_speed} WPM</span>
                         </div>
                         <div className="flex justify-between items-center bg-[#0B0E1A] p-4 rounded-lg border border-white/5">
                           <span className="text-[#7C87AC] text-xs uppercase tracking-wider">Filler Words</span>
                           <span className="font-mono text-[#E4667A] font-bold">{speechAnalysis.filler_words} detected</span>
                         </div>
                         <div className="flex justify-between items-center bg-[#0B0E1A] p-4 rounded-lg border border-white/5">
                           <span className="text-[#7C87AC] text-xs uppercase tracking-wider">Clarity</span>
                           <span className="font-mono text-[#6FD3A6] font-bold">{speechAnalysis.clarity}%</span>
                         </div>
                         <div className="flex justify-between items-center bg-[#0B0E1A] p-4 rounded-lg border border-white/5">
                           <span className="text-[#7C87AC] text-xs uppercase tracking-wider">Engagement</span>
                           <span className="font-mono text-[#C9A227] font-bold">{speechAnalysis.engagement}%</span>
                         </div>
                      </div>

                      <div className="bg-[#0B0E1A] h-full p-6 rounded-lg border border-[#8B7CFF44] shadow-[0_0_20px_#8B7CFF11] flex flex-col items-center justify-center text-center">
                         <span className="text-[11px] uppercase tracking-widest text-[#7C87AC] mb-2">Overall Confidence Score</span>
                         <span className="font-serif text-5xl text-[#F2ECDD] mb-2 drop-shadow-[0_0_10px_#8B7CFF]">{speechAnalysis.confidence}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEADERBOARD TAB (Available to all roles) */}
          {activeTab === 'leaderboard' && (
             <div className="tilt-card w-full max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out]">
                <h3 className="text-[19px] mb-[4px]">Global Leaderboard</h3>
                <p className="text-[#7C87AC] text-[13px] mb-[24px]">See how your debate scores rank against students worldwide.</p>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between bg-gradient-to-r from-[#C9A22733] to-[#0B0E1A] p-5 rounded-lg border border-[#C9A22755]">
                      <div className="flex items-center gap-4"><span className="text-xl font-mono text-[#C9A227] w-[20px]">1</span><span className="font-bold text-[#F2ECDD] text-lg">Elena Rostova</span></div>
                      <span className="font-mono text-[#C9A227] text-xl">98.5 Avg</span>
                   </div>
                   <div className="flex items-center justify-between bg-gradient-to-r from-[#7C87AC33] to-[#0B0E1A] p-5 rounded-lg border border-[#7C87AC55]">
                      <div className="flex items-center gap-4"><span className="text-xl font-mono text-[#7C87AC] w-[20px]">2</span><span className="font-bold text-[#F2ECDD] text-lg">Marcus Chen</span></div>
                      <span className="font-mono text-[#7C87AC] text-xl">95.2 Avg</span>
                   </div>
                   <div className="flex items-center justify-between bg-gradient-to-r from-[#A57A5933] to-[#0B0E1A] p-5 rounded-lg border border-[#A57A5955]">
                      <div className="flex items-center gap-4"><span className="text-xl font-mono text-[#A57A59] w-[20px]">3</span><span className="font-bold text-[#F2ECDD] text-lg">Aisha Patel</span></div>
                      <span className="font-mono text-[#A57A59] text-xl">92.0 Avg</span>
                   </div>
                   <div className="flex items-center justify-between bg-[#0B0E1A] p-5 rounded-lg border border-[#8B7CFF44] shadow-[0_0_15px_#8B7CFF22] mt-4">
                      <div className="flex items-center gap-4"><span className="font-mono text-[#8B7CFF] w-[20px] text-xl">42</span><span className="text-[#8B7CFF] font-bold text-lg">You ({user.name})</span></div>
                      <span className="font-mono text-[#8B7CFF] text-xl">75.0 Avg</span>
                   </div>
                </div>
             </div>
          )}

          {/* LIBRARY TAB (Available to all roles) */}
          {activeTab === 'library' && !selectedResource && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.4s_ease-out]">
                <div className="tilt-card">
                  <h3 className="text-[19px] mb-[16px]">Debate Frameworks</h3>
                  <div className="space-y-3">
                     <div 
                       onClick={() => { setSelectedResource('toulmin'); setResourcePage(1); }} 
                       className="p-4 bg-[#0B0E1A] rounded-lg border border-white/5 hover:border-[#8B7CFF] cursor-pointer transition shadow-sm hover:shadow-[0_0_15px_#8B7CFF44]"
                     >
                        <h4 className="text-[#F2ECDD] font-medium mb-1">Toulmin Model of Argumentation</h4>
                        <p className="text-[#7C87AC] text-xs">Learn how to construct arguments using Claim, Data, and Warrant. (Click to read)</p>
                     </div>
                     <div 
                       onClick={() => { setSelectedResource('karl_popper'); setResourcePage(1); }}
                       className="p-4 bg-[#0B0E1A] rounded-lg border border-white/5 hover:border-[#8B7CFF] cursor-pointer transition shadow-sm hover:shadow-[0_0_15px_#8B7CFF44]"
                     >
                        <h4 className="text-[#F2ECDD] font-medium mb-1">Karl Popper Format</h4>
                        <p className="text-[#7C87AC] text-xs">Cross-examination debate focusing on critical thinking. (Click to read)</p>
                     </div>
                  </div>
                </div>
                <div className="tilt-card">
                  <h3 className="text-[19px] mb-[16px]">Fallacy Masterclass</h3>
                  <div className="space-y-3">
                     <div 
                       onClick={() => { setSelectedResource('straw_man'); setResourcePage(1); }}
                       className="p-4 bg-[#0B0E1A] rounded-lg border border-white/5 hover:border-[#E4667A] cursor-pointer transition shadow-sm hover:shadow-[0_0_15px_#E4667A44]"
                     >
                        <h4 className="text-[#F2ECDD] font-medium mb-1 text-[#E4667A]">Straw Man</h4>
                        <p className="text-[#7C87AC] text-xs">Misrepresenting someone's argument to make it easier to attack. (Click to read)</p>
                     </div>
                     <div 
                       onClick={() => { setSelectedResource('ad_hominem'); setResourcePage(1); }}
                       className="p-4 bg-[#0B0E1A] rounded-lg border border-white/5 hover:border-[#E4667A] cursor-pointer transition shadow-sm hover:shadow-[0_0_15px_#E4667A44]"
                     >
                        <h4 className="text-[#F2ECDD] font-medium mb-1 text-[#E4667A]">Ad Hominem</h4>
                        <p className="text-[#7C87AC] text-xs">Attacking the person rather than the argument itself. (Click to read)</p>
                     </div>
                  </div>
                </div>
             </div>
          )}

          {/* INTERACTIVE MULTI-PAGE RESOURCE VIEWER */}
          {activeTab === 'library' && selectedResource === 'toulmin' && (
             <div className="tilt-card w-full max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out]">
                <button onClick={() => setSelectedResource(null)} className="text-[#7C87AC] hover:text-white text-sm mb-6 flex items-center gap-2 transition">
                   ← Back to Library
                </button>
                
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                   <h2 className="text-2xl text-[#8B7CFF] font-serif">The Toulmin Model of Argumentation</h2>
                   <div className="bg-[#0B0E1A] border border-[#8B7CFF55] text-[#8B7CFF] text-xs px-3 py-1 rounded-full font-bold tracking-widest uppercase">Page {resourcePage} of 3</div>
                </div>

                <div className="min-h-[250px] text-[#F2ECDD] text-[15px] leading-relaxed">
                   {resourcePage === 1 && (
                      <div className="animate-[fadeIn_0.3s_ease-out]">
                         <h3 className="text-xl mb-4 text-white">Part 1: The Core Structure</h3>
                         <p className="mb-4">The Toulmin Model, created by British philosopher Stephen Toulmin, breaks logical arguments down into six distinct components. The first three are essential to any valid argument:</p>
                         <ul className="list-disc pl-6 space-y-3 text-[#7C87AC]">
                            <li><strong className="text-white">Claim:</strong> The statement you are asking the audience to accept as true (e.g., "We should switch entirely to renewable energy").</li>
                            <li><strong className="text-white">Data (Grounds):</strong> The evidence and hard facts that support your claim (e.g., "Renewables reduce carbon emissions by 80% and are cheaper to maintain").</li>
                            <li><strong className="text-white">Warrant:</strong> The logical connection that bridges the Data to the Claim (e.g., "Reducing carbon emissions is necessary to prevent catastrophic climate change").</li>
                         </ul>
                      </div>
                   )}
                   {resourcePage === 2 && (
                      <div className="animate-[fadeIn_0.3s_ease-out]">
                         <h3 className="text-xl mb-4 text-white">Part 2: Advanced Components</h3>
                         <p className="mb-4">To make an argument truly airtight in a competitive debate, you must include Toulmin's secondary elements to defend against cross-examination:</p>
                         <ul className="list-disc pl-6 space-y-3 text-[#7C87AC]">
                            <li><strong className="text-white">Backing:</strong> Additional support specifically for the Warrant (e.g., "The IPCC global scientific consensus proves carbon drives climate change").</li>
                            <li><strong className="text-white">Rebuttal:</strong> Acknowledging exceptions to your claim to build credibility (e.g., "Unless a region completely lacks sun and wind infrastructure, in which case nuclear is an alternative").</li>
                            <li><strong className="text-white">Qualifier:</strong> Words that indicate the strength of the claim (e.g., "probably", "in most cases", "almost certainly").</li>
                         </ul>
                      </div>
                   )}
                   {resourcePage === 3 && (
                      <div className="animate-[fadeIn_0.3s_ease-out]">
                         <h3 className="text-xl mb-4 text-white">Part 3: Application in Live Debates</h3>
                         <p className="mb-4">When using our Agentic AI Debate Coach, it is specifically programmed to listen for these components in real-time. If you make a strong Claim but fail to provide the Warrant connecting it to your Data, the AI will flag your argument as logically incomplete during the feedback stage.</p>
                         <div className="bg-[#0B0E1A] p-5 rounded-lg border border-l-4 border-l-[#8B7CFF] border-y-white/5 border-r-white/5 mt-6 shadow-[0_0_20px_#8B7CFF11]">
                            <span className="text-[#8B7CFF] font-bold text-xs uppercase tracking-widest block mb-2">Pro Tip from the Coach</span>
                            Always explicitly state your Warrant. Novice debaters assume the audience makes the connection between the facts and the claim automatically. Expert debaters always spell it out clearly.
                         </div>
                      </div>
                   )}
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                   <button 
                     disabled={resourcePage === 1}
                     onClick={() => setResourcePage(p => p - 1)}
                     className="px-6 py-2 rounded-full border border-white/20 text-[#7C87AC] hover:text-white hover:border-white transition disabled:opacity-30"
                   >Previous Page</button>
                   
                   {resourcePage < 3 ? (
                      <button 
                        onClick={() => setResourcePage(p => p + 1)}
                        className="px-6 py-2 rounded-full bg-[#8B7CFF] text-[#0B0E1A] font-bold hover:bg-[#A297FF] transition shadow-[0_0_15px_#8B7CFF44]"
                      >Next Page</button>
                   ) : (
                      <button 
                        onClick={() => { setSelectedResource(null); setActiveTab('practice'); }}
                        className="px-6 py-2 rounded-full bg-[#6FD3A6] text-[#0B0E1A] font-bold hover:bg-[#8EF3C6] transition shadow-[0_0_15px_#6FD3A644]"
                      >Test Your Skills Now</button>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'library' && selectedResource === 'straw_man' && (
             <div className="tilt-card w-full max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out]">
                <button onClick={() => setSelectedResource(null)} className="text-[#7C87AC] hover:text-white text-sm mb-6 flex items-center gap-2 transition">
                   ← Back to Library
                </button>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                   <h2 className="text-2xl text-[#E4667A] font-serif">Straw Man Fallacy</h2>
                </div>
                <div className="min-h-[250px] text-[#F2ECDD] text-[15px] leading-relaxed">
                   <p className="mb-4">The Straw Man fallacy occurs when someone takes another person's argument, distorts or exaggerates it, and then attacks the extreme distortion as if that is really the claim the first person is making.</p>
                   <div className="bg-[#0B0E1A] p-4 rounded border-l-4 border-[#E4667A]">
                      <strong className="block mb-2 text-[#E4667A]">Example:</strong>
                      <p><strong>Person A:</strong> "I think we should allocate a larger portion of the town budget to education."</p>
                      <p><strong>Person B:</strong> "You want to defund the police entirely? That will lead to anarchy!"</p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'library' && selectedResource === 'ad_hominem' && (
             <div className="tilt-card w-full max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out]">
                <button onClick={() => setSelectedResource(null)} className="text-[#7C87AC] hover:text-white text-sm mb-6 flex items-center gap-2 transition">
                   ← Back to Library
                </button>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                   <h2 className="text-2xl text-[#E4667A] font-serif">Ad Hominem Fallacy</h2>
                </div>
                <div className="min-h-[250px] text-[#F2ECDD] text-[15px] leading-relaxed">
                   <p className="mb-4">Ad Hominem translates to "against the man." This fallacy occurs when an opponent attacks a person's character or motives rather than addressing the substance of their argument.</p>
                   <div className="bg-[#0B0E1A] p-4 rounded border-l-4 border-[#E4667A]">
                      <strong className="block mb-2 text-[#E4667A]">Example:</strong>
                      <p><strong>Person A:</strong> "Based on this research, we should adopt this new fiscal policy."</p>
                      <p><strong>Person B:</strong> "Why should we listen to you? You were fired from your last job."</p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'library' && selectedResource === 'karl_popper' && (
             <div className="tilt-card w-full max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out]">
                <button onClick={() => setSelectedResource(null)} className="text-[#7C87AC] hover:text-white text-sm mb-6 flex items-center gap-2 transition">
                   ← Back to Library
                </button>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                   <h2 className="text-2xl text-[#8B7CFF] font-serif">Karl Popper Debate Format</h2>
                </div>
                <div className="min-h-[250px] text-[#F2ECDD] text-[15px] leading-relaxed">
                   <p className="mb-4">Named after the famous philosopher, this format focuses heavily on critical thinking and cross-examination. It involves two teams of three debaters: Affirmative and Negative.</p>
                   <p>The unique feature of Karl Popper is that every constructive speech is immediately followed by a cross-examination period, where the opposing team directly interrogates the speaker.</p>
                </div>
             </div>
          )}

          {/* COACH DASHBOARD */}
          {user.role === 'Coach' && activeTab === 'overview' && (
            <div className="tilt-card w-full animate-[fadeIn_0.4s_ease-out]">
              <h3 className="text-[19px] mb-[16px]">Student Progress</h3>
              <p className="text-[#7C87AC] text-[13px] mt-[-8px] mb-[16px] p-3 bg-[#8B7CFF11] border border-[#8B7CFF33] rounded-lg">
                <span className="uppercase text-[10px] font-bold tracking-widest text-[#8B7CFF] block mb-1">AI Coaching Assistant</span>
                "3 of your students are struggling with Rebuttals. Run the 'Counter-Argument Drill' next practice."
              </p>
              <div className="bg-[#0B0E1A] rounded-lg p-5 border border-white/10 text-sm">
                 <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                   <span className="text-[#F2ECDD] font-semibold">Sarah Jenkins</span>
                   <span className="text-[#E4667A] bg-[#E4667A11] px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">Needs Rebuttal Practice (45/100)</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                   <span className="text-[#F2ECDD] font-semibold">Michael Chang</span>
                   <span className="text-[#6FD3A6] bg-[#6FD3A611] px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">Excelling in Evidence (92/100)</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[#F2ECDD] font-semibold">David Smith</span>
                   <span className="text-[#C9A227] bg-[#C9A22711] px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">Average Claim Score (70/100)</span>
                 </div>
              </div>
            </div>
          )}

          {/* EDUCATOR DASHBOARD */}
          {user.role === 'Educator' && activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[26px] items-start animate-[fadeIn_0.4s_ease-out]">
              <div className="flex flex-col gap-[26px]">
                  <div className="tilt-card">
                    <h3 className="text-[19px] mb-[16px]">Classroom Analytics</h3>
                    <p className="text-[#7C87AC] text-[13px] mt-[-8px] mb-[16px]">Period 3 Debate Class</p>
                    <div className="flex gap-4">
                      <div className="bg-[#0B0E1A] p-5 rounded-lg border border-white/10 flex-1 text-center shadow-[0_0_15px_#8B7CFF0a]">
                        <div className="text-4xl text-[#8B7CFF] mb-2 font-serif">78%</div>
                        <div className="text-xs text-[#7C87AC] uppercase tracking-widest">Class Avg Score</div>
                      </div>
                      <div className="bg-[#0B0E1A] p-5 rounded-lg border border-white/10 flex-1 text-center shadow-[0_0_15px_#C9A2270a]">
                        <div className="text-4xl text-[#C9A227] mb-2 font-serif">24</div>
                        <div className="text-xs text-[#7C87AC] uppercase tracking-widest">Assignments Completed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tilt-card">
                    <h3 className="text-[17px] mb-[12px] flex items-center justify-between">
                       Active Assignments
                       <span className="bg-[#8B7CFF22] text-[#8B7CFF] text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">{assignedTopics.length} Total</span>
                    </h3>
                    <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-2">
                       {assignedTopics.map((t, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#0B0E1A] p-3 rounded border border-white/5 hover:border-[#8B7CFF] transition">
                             <span className="text-sm text-[#F2ECDD] flex-1">{t}</span>
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] text-[#6FD3A6] border border-[#6FD3A655] px-2 py-0.5 rounded uppercase tracking-wider hidden sm:block">Active</span>
                               <button 
                                 onClick={() => { setActiveTab('practice'); setTopic(t); }} 
                                 className="text-[10px] text-[#8B7CFF] border border-[#8B7CFF55] bg-[#8B7CFF11] hover:bg-[#8B7CFF33] transition px-3 py-1 rounded uppercase tracking-wider cursor-pointer"
                               >
                                 Start
                               </button>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
              </div>
              
              <div className="tilt-card h-full">
                <h3 className="text-[19px] mb-[16px]">Assign New Topic</h3>
                <p className="text-[#7C87AC] text-[13px] mt-[-8px] mb-[24px]">Push a new debate topic directly to your students' dashboards.</p>
                <form onSubmit={handleAssignTopic}>
                   <input type="text" value={educatorTopic} onChange={(e) => setEducatorTopic(e.target.value)} required placeholder="e.g. Nuclear Energy Policies" className="w-full bg-[#0B0E1A] border border-white/10 text-[#F2ECDD] p-4 rounded-lg text-sm mb-4 focus:border-[#8B7CFF] transition" />
                   <button type="submit" className="w-full py-4 rounded-full bg-[#8B7CFF] text-[#0B0E1A] font-bold text-[15px] hover:bg-[#A297FF] transition tracking-wide shadow-[0_0_15px_#8B7CFF44]">
                     Assign to Class
                   </button>
                </form>
                {assignSuccess && (
                  <div className="mt-4 p-3 bg-[#6FD3A61a] border border-[#6FD3A6] text-[#6FD3A6] rounded-lg text-sm text-center animate-[fadeIn_0.3s_ease-out]">
                     Topic successfully assigned to students!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADMIN DASHBOARD */}
          {user.role === 'Admin' && activeTab === 'overview' && (
            <div className="tilt-card w-full animate-[fadeIn_0.4s_ease-out]">
              <h3 className="text-[19px] mb-[16px]">System Health</h3>
              <p className="text-[#7C87AC] text-[13px] mt-[-8px] mb-[24px]">API Usage and Role-Based Access Monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0B0E1A] p-6 rounded-lg border border-[#6FD3A644] shadow-[0_0_20px_#6FD3A611] flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-[#7C87AC]">FastAPI Backend</span>
                  <span className="text-2xl font-bold text-[#6FD3A6]">ONLINE</span>
                </div>
                <div className="bg-[#0B0E1A] p-6 rounded-lg border border-[#C9A22744] shadow-[0_0_20px_#C9A22711] flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-[#7C87AC]">Groq API Requests</span>
                  <span className="text-2xl font-bold text-[#C9A227]">1,420</span>
                </div>
                <div className="bg-[#0B0E1A] p-6 rounded-lg border border-[#8B7CFF44] shadow-[0_0_20px_#8B7CFF11] flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-widest text-[#7C87AC]">Active Users</span>
                  <span className="text-2xl font-bold text-[#8B7CFF]">342</span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
