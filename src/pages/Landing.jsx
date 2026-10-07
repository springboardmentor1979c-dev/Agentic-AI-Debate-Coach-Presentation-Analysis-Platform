import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Award, ShieldAlert, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const features = [
    { title: "Debate Simulation", desc: "Argue against advanced AI models in structured Oxford, Policy, or Parliamentary formats.", icon: Play },
    { title: "Fallacy Detection", desc: "Real-time parsing of arguments to identify ad hominem, straw man, and other fallacies.", icon: ShieldAlert },
    { title: "Speech Analytics", desc: "Track presentation pace, fillers, tone, and confidence indicators via audio upload.", icon: BarChart3 },
    { title: "Expert Coaching", desc: "Receive targeted insights, performance scores, and custom training roadmaps.", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-[#05020c] relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-wide text-white">DEBATE COACH</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition duration-200">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition duration-200 shadow-lg shadow-purple-950/40 glow-btn">
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center z-10 flex-1 justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 text-xs font-semibold text-purple-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            AI-Powered Debate and Presentation Coaching
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-white font-sans">
            Master the Art of <br />
            <span className="text-gradient">Persuasive Argumentation</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
            Elevate your debating, logical reasoning, and presentation skills through targeted AI evaluations, structured format practices, and robust fallacy tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition duration-200 shadow-xl shadow-purple-950/30 text-sm glow-btn cursor-pointer"
            >
              Get Started for Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl glass-panel border border-white/10 hover:bg-white/5 text-white font-semibold transition duration-200 text-sm cursor-pointer"
            >
              Explore Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-20"
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="glass-panel glass-panel-hover p-6 rounded-2xl text-left border border-white/5 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:text-purple-300 transition duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 border-t border-white/5 z-10">
        &copy; {new Date().getFullYear()} Agentic AI Debate Coach. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
