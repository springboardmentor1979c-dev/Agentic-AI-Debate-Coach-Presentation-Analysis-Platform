import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { 
  IoCalendar, IoTime, IoPlay, IoPause, IoStopCircle, IoDocumentText,
  IoPersonAdd, IoCloseCircle, IoVolumeHigh, IoTrendingUp, IoSparkles
} from 'react-icons/io5';

const DebateSessions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null); // When a debate starts
  const [sessions, setSessions] = useState([
    { id: '1', title: 'Carbon Taxation Policy', format: 'Oxford Union', date: 'Jul 30, 2026', time: '10:00 AM', status: 'Scheduled', duration: '8 min' },
    { id: '2', title: 'AI Intellectual Property Rights', format: 'Parliamentary', date: 'Jul 26, 2026', time: '02:30 PM', status: 'Completed', score: '86/100', duration: '10 min' },
    { id: '3', title: 'Healthcare Privatization', format: 'Public Forum', date: 'Jul 20, 2026', time: '11:15 AM', status: 'Completed', score: '81/100', duration: '6 min' },
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newFormat, setNewFormat] = useState('Oxford Union');
  const [newDuration, setNewDuration] = useState('8 min');
  const [newDate, setNewDate] = useState('2026-07-31');
  const [newTime, setNewTime] = useState('14:00');

  // Active Session simulation states
  const [seconds, setSeconds] = useState(480); // 8 minutes default
  const [timerActive, setTimerActive] = useState(false);
  const [transcript, setTranscript] = useState([
    "[0:05] AI OPPONENT: Social cost of carbon must be corrected via regulatory taxation...",
    "[0:32] ALEX (YOU): Social taxing alone restricts early-stage green energy tech startup expansion...",
  ]);
  const [noteText, setNoteText] = useState('');

  // Handle countdown
  useEffect(() => {
    let interval = null;
    if (timerActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, seconds]);

  // Format timer
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const newSession = {
      id: `${sessions.length + 1}`,
      title: newTitle || 'Untitled Debate Motion',
      format: newFormat,
      date: newDate,
      time: newTime,
      status: 'Scheduled',
      duration: newDuration,
    };
    setSessions([newSession, ...sessions]);
    setNewTitle('');
    setIsModalOpen(false);
  };

  const handleStartSession = (session) => {
    setActiveSession(session);
    setSeconds(parseInt(session.duration) * 60 || 480);
    setTimerActive(true);
    setTranscript([
      "[0:00] MODERATOR: Welcome to the round on: '" + session.title + "'. You are speaking first.",
      "[0:10] SPEECH ENGINE: (Awaiting microphone input...)"
    ]);
  };

  const handleAddTranscriptLine = () => {
    const lines = [
      "Evidence points to carbon dividends reducing net-poverty indexes.",
      "Industrial emissions have dropped by 18% in Sweden post implementation.",
      "Green energy subsidies outperform taxes in securing rapid wind capacity."
    ];
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    const elapsed = formatTime(parseInt(activeSession.duration) * 60 - seconds);
    setTranscript(prev => [...prev, `[${elapsed}] ALEX (YOU): ${randomLine}`]);
  };

  return (
    <div className="space-y-8">
      {/* Upper control heading */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Debate Practice Rooms
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Setup formal debate structures, track transcripts, and review recordings.
          </p>
        </div>
        {!activeSession && (
          <Button variant="primary" size="sm" icon={IoCalendar} onClick={() => setIsModalOpen(true)}>
            Schedule New Session
          </Button>
        )}
      </div>

      {activeSession ? (
        /* Active Debate Sparring Room Layout */
        <div className="grid lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Transcript Log & Waveform */}
          <Card variant="deep" className="lg:col-span-2 flex flex-col justify-between h-[500px]" hoverEffect={false}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkbg-border pb-4">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Debate Round</span>
                <h3 className="font-display font-extrabold text-base md:text-lg text-slate-800 dark:text-white">{activeSession.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display font-black text-xl text-rose-500 tabular-nums">
                  {formatTime(seconds)}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTimerActive(!timerActive)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-darkbg-accent text-slate-700 hover:opacity-80"
                  >
                    {timerActive ? <IoPause className="h-4.5 w-4.5" /> : <IoPlay className="h-4.5 w-4.5" />}
                  </button>
                  <Button variant="danger" size="sm" icon={IoStopCircle} onClick={() => setActiveSession(null)}>
                    End Debate
                  </Button>
                </div>
              </div>
            </div>

            {/* Simulated Live Transcript Screen */}
            <div className="flex-1 overflow-y-auto py-6 space-y-3 font-mono text-xs text-slate-650 dark:text-slate-350">
              {transcript.map((line, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-darkbg-accent/30 border border-slate-100 dark:border-darkbg-border/60">
                  {line}
                </div>
              ))}
            </div>

            {/* Microphone Simulator Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-darkbg-border flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> Microphone is capturing audio
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleAddTranscriptLine}>
                  Simulate Speech Influx
                </Button>
              </div>
            </div>
          </Card>

          {/* Notepad Panel */}
          <Card variant="glass" className="h-[500px] flex flex-col justify-between" hoverEffect={false}>
            <div>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                <IoDocumentText className="text-indigo-500" /> Session Notes
              </h4>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Draft your counters, write down definitions or quotes to rebut here during the speech..."
                className="w-full h-[360px] bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
              />
            </div>
            <p className="text-[10px] text-slate-400">Notes are saved to dashboard analytics reports.</p>
          </Card>
        </div>
      ) : (
        /* Regular Session Scheduling List */
        <div className="space-y-6">
          {/* Scheduling list grids */}
          <div className="grid md:grid-cols-3 gap-6">
            {sessions.filter(s => s.status === 'Scheduled').map((session) => (
              <Card key={session.id} hoverEffect={true} variant="glass" className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-bold text-indigo-650 dark:text-brand-350 bg-indigo-50 dark:bg-brand-950/45 border border-indigo-100 dark:border-brand-900/60 rounded px-2 py-0.5">
                      {session.format}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                      <IoTime /> {session.duration}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-850 dark:text-slate-100 mb-2 truncate">{session.title}</h4>
                  <p className="text-[10px] text-slate-450 font-semibold">{session.date} at {session.time}</p>
                </div>
                <Button 
                  onClick={() => handleStartSession(session)} 
                  variant="primary" 
                  size="sm" 
                  icon={IoPlay}
                  className="mt-6 w-full"
                >
                  Start Live practice
                </Button>
              </Card>
            ))}
          </div>

          {/* Session History Table */}
          <Card variant="glass" hoverEffect={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
                Session History Log
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Showing last 2 rounds</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/50 dark:border-darkbg-border pb-3">
                    <th className="pb-3">Debate Motion</th>
                    <th className="pb-3">Format</th>
                    <th className="pb-3">Completed Date</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 text-right">AI Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border">
                  {sessions.filter(s => s.status === 'Completed').map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/20 dark:hover:bg-darkbg-accent/10 transition-colors">
                      <td className="py-4 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate">{session.title}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{session.format}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{session.date}</td>
                      <td className="py-4 text-slate-450">{session.duration}</td>
                      <td className="py-4 text-right">
                        <span className="font-display font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 px-2 py-1 rounded-lg">
                          {session.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Debate Motion">
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Topic Motion Name</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Ban Corporate Funding in Elections"
              className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Format</label>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option>Oxford Union</option>
                <option>Parliamentary</option>
                <option>Policy Debate</option>
                <option>Public Forum</option>
                <option>AI Simulation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Duration</label>
              <select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option>5 min</option>
                <option>8 min</option>
                <option>10 min</option>
                <option>15 min</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-darkbg-border">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DebateSessions;
