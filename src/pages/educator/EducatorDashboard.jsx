import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { IoSchool, IoStatsChart, IoCalendar, IoTrophy, IoCheckmarkCircle, IoPeople } from 'react-icons/io5';

const EducatorDashboard = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [assignments, setAssignments] = useState([
    { id: '1', motion: "Ban Corporate Campaign Funding", class: "Intro to Rhetoric A", due: "Aug 02, 2026", doneRatio: "14/18", progress: 77 },
    { id: '2', motion: "AI Intellectual Property Rights", class: "Advanced debate Society", due: "Jul 31, 2026", doneRatio: "11/14", progress: 78 },
  ]);

  const [newMotion, setNewMotion] = useState('');
  const [newClass, setNewClass] = useState('Intro to Rhetoric A');
  const [newDue, setNewDue] = useState('2026-08-05');

  const handleAssignPrompt = (e) => {
    e.preventDefault();
    if (!newMotion.trim()) return;
    
    const newAss = {
      id: `${assignments.length + 1}`,
      motion: newMotion,
      class: newClass,
      due: newDue,
      doneRatio: `0/${newClass.includes('Intro') ? '18' : '14'}`,
      progress: 0
    };
    setAssignments([newAss, ...assignments]);
    setNewMotion('');
    setIsToastVisible(true);
  };

  // Mock data
  const classTrend = [
    { name: 'Wk 1', classA: 72, classB: 68 },
    { name: 'Wk 2', classA: 74, classB: 70 },
    { name: 'Wk 3', classA: 78, classB: 72 },
    { name: 'Wk 4', classA: 81, classB: 76 },
    { name: 'Wk 5', classA: 84, classB: 78 },
  ];

  const leaderboard = [
    { rank: 1, name: "Elena Rostova", score: 91, xp: "2840 XP", class: "Advanced Debate" },
    { rank: 2, name: "Sarah Lin", score: 88, xp: "2410 XP", class: "Advanced Debate" },
    { rank: 3, name: "Alex Mercer", score: 84, xp: "1840 XP", class: "Intro to Rhetoric A" },
    { rank: 4, name: "Marcus Vance", score: 78, xp: "1450 XP", class: "Intro to Rhetoric A" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Educator Panel
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Oversee classroom averages, schedule speech assignments, and track class leaderboards.
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Total Classes", value: "2 Classes", icon: IoSchool, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { name: "Total Roster", value: "32 Students", icon: IoPeople, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
          { name: "Active Assignments", value: assignments.length, icon: IoCalendar, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
          { name: "Global Course Progress", value: "82%", icon: IoCheckmarkCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="glass" className="p-5 flex flex-col justify-between" hoverEffect={true}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.name}</span>
                <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xl md:text-2xl font-black font-display text-slate-900 dark:text-white">{item.value}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts & Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Class Averages chart */}
        <Card variant="glass" className="lg:col-span-2" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Class average trends</h3>
              <p className="text-[10px] text-slate-450">Weekly score index comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-500"><span className="h-2 w-2 rounded-full bg-blue-500" /> Intro Rhetoric</span>
              <span className="flex items-center gap-1.5 text-purple-500"><span className="h-2 w-2 rounded-full bg-purple-500" /> Advanced Debate</span>
            </div>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="classA" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="classB" stroke="#a855f7" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Student Leaderboard</h3>
            <IoTrophy className="text-amber-500 h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-4">
            {leaderboard.map((student) => (
              <div key={student.rank} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-darkbg-accent/30 border border-slate-100 dark:border-darkbg-border/60">
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-sm text-slate-450 dark:text-slate-500">#{student.rank}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{student.name}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{student.class} • {student.xp}</span>
                  </div>
                </div>
                <span className="text-xs font-black font-display text-indigo-650 dark:text-brand-300">
                  {student.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Assignments & Assign form */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Active Prompts tracker */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Active debate prompts</h3>
            <p className="text-[10px] text-slate-450">Completion stats per topic</p>
          </div>

          <div className="space-y-5">
            {assignments.map((ass) => (
              <div key={ass.id} className="space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{ass.motion}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{ass.class} • Due: {ass.due}</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-brand-350">{ass.doneRatio}</span>
                </div>
                <div className="w-full bg-slate-150 dark:bg-darkbg-accent h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ass.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Assign new prompt form */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Assign New Debate Prompt</h3>
            <p className="text-[10px] text-slate-450 font-semibold">Broadside a topic to selected classrooms</p>
          </div>

          <form onSubmit={handleAssignPrompt} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Debate Motion Statement</label>
              <input
                type="text"
                required
                value={newMotion}
                onChange={(e) => setNewMotion(e.target.value)}
                placeholder="e.g. Social media platforms must be regulated like utilities"
                className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Target Class</label>
                <select
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option>Intro to Rhetoric A</option>
                  <option>Advanced Debate Society</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-2">Due Date</label>
                <input
                  type="date"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-2 text-xs text-slate-850 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm">Assign to Class</Button>
            </div>
          </form>
        </Card>

      </div>

      <Toast 
        message="New debate prompt has been broadside to class student rosters!" 
        type="success" 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />
    </div>
  );
};

export default EducatorDashboard;
