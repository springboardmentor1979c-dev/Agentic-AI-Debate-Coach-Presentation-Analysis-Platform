import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { IoPeople, IoCalendar, IoCheckmarkCircle, IoSparkles, IoChatbubbleEllipses, IoArrowForward } from 'react-icons/io5';

const CoachDashboard = () => {
  const [students, setStudents] = useState([
    { id: '1', name: "Alex Mercer", recentScore: 84, pace: "135 WPM", fallacyCount: 1, feedbackStatus: "Reviewed" },
    { id: '2', name: "Elena Rostova", recentScore: 91, pace: "142 WPM", fallacyCount: 0, feedbackStatus: "Pending Review" },
    { id: '3', name: "Marcus Vance", recentScore: 78, pace: "155 WPM", fallacyCount: 3, feedbackStatus: "Reviewed" },
    { id: '4', name: "Sarah Lin", recentScore: 88, pace: "139 WPM", fallacyCount: 0, feedbackStatus: "Pending Review" },
  ]);

  const [activeStudent, setActiveStudent] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || !activeStudent) return;
    
    // Update student status
    setStudents(students.map(s => s.id === activeStudent.id ? { ...s, feedbackStatus: "Reviewed" } : s));
    setFeedbackText('');
    setActiveStudent(null);
    setToastVisible(true);
  };

  const chartData = students.map(s => ({
    name: s.name.split(' ')[0],
    score: s.recentScore,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          Coach Console
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review pupil transcripts, monitor speaking pacing, and submit qualitative mentorship feedback.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Total Pupils", value: students.length, icon: IoPeople, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { name: "Class Score Average", value: "85/100", icon: IoSparkles, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
          { name: "Pending Reviews", value: students.filter(s => s.feedbackStatus === "Pending Review").length, icon: IoChatbubbleEllipses, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
          { name: "Syllabus Targets Met", value: "90%", icon: IoCheckmarkCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
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

      {/* Main grids */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Student roster */}
        <Card variant="glass" className="lg:col-span-2" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Student Roster</h3>
            <span className="text-[10px] font-bold text-slate-450 uppercase">Active League</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-450 font-bold border-b border-slate-200/40 dark:border-darkbg-border pb-3 uppercase tracking-wider">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Recent AI Score</th>
                  <th className="pb-3">Speech Pacing</th>
                  <th className="pb-3">Fallacies Committed</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/20 dark:hover:bg-darkbg-accent/10">
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{student.name}</td>
                    <td className="py-4 font-semibold text-indigo-650 dark:text-brand-350">{student.recentScore}/100</td>
                    <td className="py-4 text-slate-500">{student.pace}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        student.fallacyCount > 0 ? 'bg-rose-50 dark:bg-rose-950/25 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-500'
                      }`}>
                        {student.fallacyCount} flags
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {student.feedbackStatus === "Pending Review" ? (
                        <button
                          onClick={() => setActiveStudent(student)}
                          className="text-xs font-bold text-indigo-600 dark:text-brand-400 hover:underline"
                        >
                          Send Feedback
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">Reviewed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Competency Chart */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Class Comparison</h3>
            <p className="text-[10px] text-slate-450">Recent scores across current roster</p>
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Feedback panel editor */}
      {activeStudent && (
        <Card variant="deep" className="border-l-4 border-l-brand-600 animate-fadeIn" hoverEffect={false}>
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200 mb-2">
            Writing Coach Feedback for <span className="text-indigo-600 dark:text-brand-400 font-black">{activeStudent.name}</span>
          </h3>
          <p className="text-xs text-slate-450 mb-4">Provide suggestions on speech pacing, refutation structure, or style delivery adjustments.</p>
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Try slowing down your introductory thesis, you started at 155 WPM which was slightly fast. Good job identifying the strawman attack in cross-examination."
              className="w-full h-28 bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-2xl p-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setActiveStudent(null)} variant="outline" size="sm">Cancel</Button>
              <Button type="submit" variant="primary" size="sm">Submit Feedback</Button>
            </div>
          </form>
        </Card>
      )}

      <Toast 
        message="Feedback submitted successfully to the student's dashboard!" 
        type="success" 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </div>
  );
};

export default CoachDashboard;
