import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { IoPerson, IoShieldCheckmark, IoSparkles, IoTrophy, IoMail, IoCalendar } from 'react-icons/io5';

const LearnerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [newGoal, setNewGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const currentGoals = user?.learningGoals || [];
    updateProfile({ learningGoals: [...currentGoals, newGoal.trim()] });
    setNewGoal('');
  };

  const handleRemoveGoal = (index) => {
    const currentGoals = user?.learningGoals || [];
    updateProfile({ learningGoals: currentGoals.filter((_, idx) => idx !== index) });
  };

  const handleSaveName = () => {
    updateProfile({ name });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Profile Cover card */}
      <Card variant="deep" className="relative p-8 overflow-visible flex flex-col md:flex-row items-center gap-6" hoverEffect={false}>
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[32px] pointer-events-none" />

        <div className="h-24 w-24 rounded-3xl overflow-hidden border-2 border-indigo-500/30 shrink-0 relative z-10">
          <img src={user?.photo} alt={user?.name} className="h-full w-full object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          {isEditing ? (
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100"
              />
              <Button onClick={handleSaveName} variant="primary" size="sm">Save</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">{user?.name}</h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-500 hover:underline font-bold"
              >
                (Edit Name)
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-450 mt-2 font-semibold">
            <span className="flex items-center gap-1"><IoMail /> {user?.email}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><IoCalendar /> Joined {user?.joinedDate || 'Jan 2026'}</span>
          </div>
        </div>

        <div className="shrink-0 text-center md:text-right relative z-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Speaker Experience</span>
          <span className="font-display font-black text-2xl text-gradient-primary mt-1 block">{user?.experience} XP</span>
          <span className="text-[10px] text-emerald-500 font-bold block mt-1">Level 4 Debater</span>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Learning Goals list */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
              Active Learning Goals
            </h3>
            <p className="text-[10px] text-slate-450">Objectives analyzed in speech sparring</p>
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g. Master eye contact, lower volume variance"
              className="flex-1 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="sm">Add</Button>
          </form>

          <div className="space-y-2.5">
            {user?.learningGoals?.map((goal, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-darkbg-accent/40 border border-slate-100 dark:border-darkbg-border/60">
                <span className="text-xs text-slate-650 dark:text-slate-250 flex items-center gap-2">
                  <IoCheckmarkCircle className="text-emerald-500 h-4 w-4" />
                  {goal}
                </span>
                <button
                  onClick={() => handleRemoveGoal(idx)}
                  className="text-xs text-rose-500 hover:underline font-bold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Preferred Topics Tags */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
              Preferred Debate Topics
            </h3>
            <p className="text-[10px] text-slate-450">Topics set in sparring profiles</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {user?.preferredTopics?.map((topic, idx) => (
              <span 
                key={idx}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-650 dark:text-brand-350 bg-indigo-50/50 dark:bg-brand-950/45 border border-indigo-150/40 dark:border-brand-900/60"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-tr from-brand-950/30 to-darkbg-accent border border-brand-900/60 rounded-2xl text-xs text-slate-450 leading-relaxed mt-10">
            <span className="font-bold text-brand-350 flex items-center gap-1.5 mb-1.5">
              <IoSparkles /> Credentials verification
            </span>
            Alex is cleared to represent the university in British Parliamentary matches. All logs are synced to the educator dashboard.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LearnerProfile;
