import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { IoNotifications, IoTrash, IoMailOpen, IoSparkles, IoCalendar, IoWarning } from 'react-icons/io5';

const LearnerNotifications = () => {
  const [items, setItems] = useState([
    { id: 1, type: "coaching", title: "AI Practice Recommendation", desc: "Based on your last presentation analysis, we recommend running a 5-minute Speed Control session to slow down your transitions.", date: "Today, 10:30 AM", unread: true, icon: IoSparkles, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
    { id: 2, type: "calendar", title: "Upcoming Debate Scheduled", desc: "Your session on 'Carbon Taxation Policy' with Coach Vance starts tomorrow at 10:00 AM. Review your note prep deck.", date: "Yesterday, 2:15 PM", unread: true, icon: IoCalendar, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" },
    { id: 3, type: "system", title: "New Milestone Reached", desc: "Congratulations! You completed the 'Logical Fallacy Defense' roadmap level. Claim your +200 XP reward in the coaching portal.", date: "3 days ago", unread: false, icon: IoNotifications, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
    { id: 4, type: "warning", title: "High Filler Word Alert", desc: "AI audit flagged 'basically' as an overused term in your climate talk. Reduce its repetition in upcoming rounds.", date: "5 days ago", unread: false, icon: IoWarning, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" },
  ]);

  const markAllRead = () => {
    setItems(items.map(item => ({ ...item, unread: false })));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
            Notifications Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with recent tutor feedbacks, schedules, and AI warnings.
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={markAllRead} variant="outline" size="sm" icon={IoMailOpen}>
              Mark All Read
            </Button>
            <Button onClick={clearAll} variant="secondary" size="sm" icon={IoTrash}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <Card variant="glass" className="p-0 overflow-hidden" hoverEffect={false}>
          <div className="divide-y divide-slate-100 dark:divide-darkbg-border">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id} 
                  className={`p-6 flex gap-4 transition-colors ${
                    item.unread ? 'bg-indigo-50/10 dark:bg-brand-950/5' : 'hover:bg-slate-50/40 dark:hover:bg-darkbg-accent/10'
                  }`}
                >
                  <div className={`p-3 rounded-2xl shrink-0 h-11 w-11 flex items-center justify-center ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {item.title}
                          {item.unread && (
                            <span className="h-2 w-2 rounded-full bg-indigo-550 dark:bg-brand-400" />
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-darkbg-accent transition-colors"
                      title="Delete"
                    >
                      <IoTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white/30 dark:bg-darkbg-accent/10 border border-dashed border-slate-200 dark:border-darkbg-border rounded-[32px]">
          <div className="p-4 bg-indigo-50 dark:bg-darkbg-accent text-indigo-500 rounded-2xl mb-4 inline-block">
            <IoNotifications className="h-8 w-8" />
          </div>
          <h4 className="font-display font-bold text-base text-slate-850 dark:text-slate-200">All Caught Up!</h4>
          <p className="text-xs text-slate-450 mt-1">You have no new notifications.</p>
        </div>
      )}
    </div>
  );
};

export default LearnerNotifications;
