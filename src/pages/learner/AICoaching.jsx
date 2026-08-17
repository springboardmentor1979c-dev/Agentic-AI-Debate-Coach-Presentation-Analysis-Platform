import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  IoFlame, IoCheckmarkCircle, IoLockClosed, IoSparkles, 
  IoTrophy, IoAnalytics, IoFlag, IoHeartCircle 
} from 'react-icons/io5';

const AICoaching = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestones, setMilestones] = useState([
    { id: 1, title: "Speed & Pacing Control", desc: "Maintain steady speaking output between 130 and 150 words per minute.", xp: "150 XP", status: "Completed", icon: IoFlag },
    { id: 2, title: "Logical Fallacy Defense", desc: "Identify and correct Ad Hominem and Strawman arguments in debate sparring.", xp: "200 XP", status: "Completed", icon: IoAnalytics },
    { id: 3, title: "Structuring Refutations", desc: "Implement the four-step refutation method (They say, We say, Because, Impact).", xp: "250 XP", status: "In Progress", icon: IoSparkles },
    { id: 4, title: "Advanced Evidence Weight", desc: "Analyze source strength, identify correlation vs causation, and back up claims.", xp: "300 XP", status: "Locked", icon: IoLockClosed },
    { id: 5, title: "Oxford Tournament Sparring", desc: "Engage in an 8-minute AI-moderated Oxford-style debate simulator.", xp: "500 XP", status: "Locked", icon: IoTrophy }
  ]);

  const dailyChallenges = [
    { title: "Complete one AI Debate match", xp: "+100 XP", progress: "1 / 1", done: true },
    { title: "Upload a 3-minute presentation draft", xp: "+150 XP", progress: "0 / 1", done: false },
    { title: "Detect 3 fallacies in quiz practice", xp: "+50 XP", progress: "2 / 3", done: false }
  ];

  const achievements = [
    { title: "First Sparring Done", desc: "Completed first AI Debate round.", icon: IoFlag, unlocked: true },
    { title: "Fallacy Slayer", desc: "Identified all 8 logical fallacies.", icon: IoAnalytics, unlocked: true },
    { title: "Optimal Pacer", desc: "Maintained 140 WPM speed for 5 min.", icon: IoSparkles, unlocked: false },
    { title: "Tournament Champion", desc: "Won a debate round against the Expert AI.", icon: IoTrophy, unlocked: false }
  ];

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const handleClaimReward = (id) => {
    // Mark completed or trigger celebration
    triggerCelebration();
    setMilestones(prev => 
      prev.map(m => m.id === id ? { ...m, status: "Completed" } : m)
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Celebration Confetti Overlay Simulation (using CSS particles) */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/10 backdrop-blur-[1px] transition-opacity" />
          <div className="relative text-center bg-white dark:bg-darkbg-card p-8 rounded-3xl border border-indigo-500/50 shadow-2xl z-10 animate-bounce">
            <IoTrophy className="h-16 w-16 text-amber-400 mx-auto animate-pulse" />
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white mt-4">Milestone Unlocked!</h3>
            <p className="text-xs text-slate-500 mt-1">+250 XP Credited to Profile</p>
          </div>
          {/* Create float-up particle items */}
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-3 w-3 rounded-full" 
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
                backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
                animation: `bubble ${Math.random() * 4 + 2}s infinite linear`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            AI Speech Coach Roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Follow your structured roadmap, complete challenges, and earn speaking credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-brand-950/45 border border-indigo-150 dark:border-brand-900/60 rounded-xl px-4 py-2 text-xs font-bold text-indigo-650 dark:text-brand-350">
          <IoFlame className="h-4.5 w-4.5 animate-pulse text-amber-500" />
          Level 4 Debater (1840 XP)
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Timeline Path */}
        <Card variant="glass" className="lg:col-span-2" hoverEffect={false}>
          <div className="mb-8">
            <h3 className="font-display font-bold text-base md:text-lg text-slate-800 dark:text-slate-200">
              Personalized Learning Pathway
            </h3>
            <p className="text-[10px] text-slate-400">Step-by-step program customized to clear your skill gaps</p>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-darkbg-border">
            {milestones.map((m) => {
              const Icon = m.icon;
              const isCompleted = m.status === "Completed";
              const isInProgress = m.status === "In Progress";
              const isLocked = m.status === "Locked";

              return (
                <div key={m.id} className="relative">
                  {/* Indicator Icon */}
                  <div className={`absolute -left-[37px] h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : isInProgress 
                        ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse' 
                        : 'bg-white dark:bg-darkbg-card border-slate-300 dark:border-darkbg-border text-slate-400'
                  }`}>
                    {isCompleted ? <IoCheckmarkCircle className="h-4 w-4" /> : <Icon className="h-3 w-3" />}
                  </div>

                  <div className={`p-5 rounded-2xl border transition-all ${
                    isInProgress 
                      ? 'bg-indigo-50/20 border-indigo-500/30 dark:bg-brand-950/20' 
                      : 'bg-white/45 dark:bg-darkbg-accent/40 border-slate-100 dark:border-darkbg-border/60'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {m.title}
                          {isInProgress && (
                            <span className="text-[9px] bg-indigo-100 dark:bg-brand-950 text-indigo-600 dark:text-brand-350 px-2 py-0.5 rounded-full font-bold">
                              Active
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">{m.xp}</span>
                        {isInProgress && (
                          <button
                            onClick={() => handleClaimReward(m.id)}
                            className="text-[10px] font-bold text-indigo-600 dark:text-brand-400 hover:underline mt-2 block"
                          >
                            Unlocks Reward
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Daily Challenges & Achievements */}
        <div className="space-y-6">
          
          {/* Daily Goals */}
          <Card variant="glass" hoverEffect={false}>
            <div className="mb-6">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Daily Targets</h3>
              <p className="text-[10px] text-slate-450">Resets in 12 hours</p>
            </div>

            <div className="space-y-4">
              {dailyChallenges.map((ch, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-darkbg-accent/30 border border-slate-100 dark:border-darkbg-border/40">
                  <div>
                    <h4 className={`text-xs font-bold ${ch.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {ch.title}
                    </h4>
                    <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{ch.xp}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ch.done ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-darkbg-accent text-slate-500'}`}>
                    {ch.progress}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Badges / Trophy Room */}
          <Card variant="glass" hoverEffect={false}>
            <div className="mb-6 flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Achievements Unlocked</h3>
              <IoTrophy className="h-5 w-5 text-amber-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((ach, idx) => {
                const Icon = ach.icon;
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center ${
                      ach.unlocked 
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/20' 
                        : 'bg-slate-50/30 dark:bg-darkbg-accent/10 border-slate-200/50 dark:border-darkbg-border opacity-50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl mb-2 ${
                      ach.unlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-darkbg-accent text-slate-450'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate max-w-full">{ach.title}</span>
                    <p className="text-[8px] text-slate-400 mt-0.5 leading-tight truncate max-w-full">{ach.desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default AICoaching;
