import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { 
  IoChatboxEllipses, IoMic, IoWarning, IoGitMerge, IoCheckmarkCircle, 
  IoArrowForward, IoStatsChart, IoStar, IoChevronDown, IoMenu, IoClose
} from 'react-icons/io5';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: IoChatboxEllipses,
      title: "AI Debate Coach",
      desc: "Simulate real-time debates on any topic. Choose sides and challenge an agentic debater that responds with structured rebuttals."
    },
    {
      icon: IoMic,
      title: "Presentation Analysis",
      desc: "Upload audio or video files. Receive insights on speech speed, volume tone, engagement levels, and filler words."
    },
    {
      icon: IoCheckmarkCircle,
      title: "Argument Analyzer",
      desc: "Paste claims to extract evidentiary support, analyze reasoning weight, and review structural persuasiveness instantly."
    },
    {
      icon: IoWarning,
      title: "Logical Fallacy Detection",
      desc: "Identify errors such as Strawman, Ad Hominem, and Slippery Slope. Learn corrections using real-world examples."
    },
    {
      icon: IoGitMerge,
      title: "Counterargument Generator",
      desc: "Submit controversial viewpoints and generate logical, ethical, and evidence-supported rebuttals on the fly."
    },
    {
      icon: IoStatsChart,
      title: "Personalized AI Coaching",
      desc: "Follow interactive roadmaps, practice targets, and custom achievements to overcome gaps in speaking and analysis."
    }
  ];

  const faqs = [
    {
      q: "How does the AI evaluate debate rounds?",
      a: "Our models check your arguments for evidentiary strength, logical flow, structure (claims, backing, impact), and flag any of the 8 standard logical fallacies. Voice tone and clarity are also reviewed."
    },
    {
      q: "Can I use it to practice presentation slides?",
      a: "Yes! Our Presentation Analysis module accepts video, audio, and PPT files, examining non-verbal body language, eye contact, speech pace, and usage of filler words."
    },
    {
      q: "What debate formats are supported?",
      a: "We support standard Oxford Union style, Parliamentary (British/American), Policy Debate, Public Forum, and a customizable AI Simulation format."
    },
    {
      q: "Can educators monitor multiple student accounts?",
      a: "Absolutely. With our Educator and Coach Dashboards, teachers can assign debate prompts, monitor overall classroom rosters, view skill heatmaps, and send direct feedback."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base text-slate-800 dark:text-slate-100 relative">
      
      {/* Glow Backdrops */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-[15%] left-[5%] w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] animate-pulse-slow pointer-events-none" />
      <div className="absolute top-[25%] right-[5%] w-96 h-96 rounded-full bg-purple-600/10 blur-[140px] animate-pulse-slow pointer-events-none" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-darkbg-border bg-slate-50/70 dark:bg-darkbg-base/70 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
              🧠
            </div>
            <span className="font-display font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600 dark:from-blue-400 dark:to-brand-400">
              DebateIQ AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-650 dark:text-slate-350">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-white transition-colors">FAQs</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Start Free</Button>
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-darkbg-border text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <IoClose className="h-5 w-5" /> : <IoMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-darkbg-border px-6 py-4 flex flex-col gap-4 bg-slate-50 dark:bg-darkbg-base">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">How It Works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600 dark:text-slate-300">FAQs</a>
            <hr className="border-slate-200 dark:border-darkbg-border" />
            <div className="flex gap-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="primary" size="sm" className="w-full">Start Free</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tag */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-150 dark:border-brand-900 bg-indigo-50/50 dark:bg-brand-950/45 text-xs font-bold text-indigo-650 dark:text-brand-350 mb-6">
            ✨ Next-Gen Argument Analysis Powered by AI
          </span>

          {/* Heading */}
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-7xl tracking-tight leading-none mb-6 max-w-4xl mx-auto text-slate-900 dark:text-white">
            Master Debates.<br/>
            Improve Presentations.<br/>
            <span className="text-gradient-primary">Think Smarter with AI.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your debate or presentation and receive instant AI coaching, argument analysis, logical fallacy detection, speech insights, counterarguments, and personalized improvement recommendations.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Start Free Now</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Watch Demo</Button>
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview Image Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden glass-panel border border-slate-200/50 dark:border-white/10 shadow-2xl p-2.5"
        >
          <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl hover:scale-110 cursor-pointer transition-transform shadow-lg shadow-indigo-500/20">
                ▶
              </div>
              <span className="text-white text-sm font-bold font-display uppercase tracking-widest bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                Watch platform overview
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-darkbg-border/60">
        <div className="text-center mb-16">
          <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
            Unleash Advanced Debate Analysis
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Our agentic system evaluates public speeches and arguments using rigorous academic standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} hoverEffect={true} variant="glass" className="flex flex-col items-start text-left">
                <div className="p-3.5 bg-indigo-50 dark:bg-darkbg-accent text-indigo-600 dark:text-brand-400 rounded-2xl mb-5 shadow-inner">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{feat.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it Works Step Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-darkbg-border/60 text-center">
        <div className="mb-16">
          <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
            How DebateIQ AI Works
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Go from upload to actionable coaching insights in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
          <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent hidden md:block pointer-events-none" />
          
          {[
            { step: "01", title: "Select Mode & Upload", desc: "Choose AI sparring, presentation video analysis, or upload written debate briefs." },
            { step: "02", title: "Agentic Evaluation", desc: "DebateIQ engines extract claims, check fallacy cards, and calculate pace metrics." },
            { step: "03", title: "Coaching Roadmap", desc: "Access dashboards to fill speech skill gaps, track growth trends, and unlock goals." }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-darkbg-card dark:to-darkbg-accent border border-slate-200 dark:border-darkbg-border flex items-center justify-center font-display font-black text-xl text-gradient-primary shadow-md mb-6">
                {item.step}
              </div>
              <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-darkbg-border/60">
        <div className="text-center mb-16">
          <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
            Endorsed by Top Orators
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Read stories from individuals who accelerated their professional articulation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Elena Rostova",
              role: "Oxford Debate Society Coach",
              quote: "The fallacy detection catches circular reasoning and strawman attacks in seconds. It has transformed the speed at which our student debaters prep rebuttals.",
              stars: 5,
              pic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80"
            },
            {
              name: "Marcus Vance",
              role: "Director of Product, FinTech",
              quote: "My presentation speech pace analysis showed I use 'like' and 'uhm' 14 times per minute. With DebateIQ's pacing coaching, I cut it down to zero.",
              stars: 5,
              pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
            },
            {
              name: "Dr. Sarah Lin",
              role: "Professor of Political Science",
              quote: "Setting class prompts and reviewing student arguments through the Educator Dashboard makes grading debate clubs seamless. A masterclass in AI application.",
              stars: 5,
              pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
            }
          ].map((test, idx) => (
            <Card key={idx} hoverEffect={true} variant="glass" className="flex flex-col h-full justify-between text-left">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(test.stars)].map((_, i) => (
                    <IoStar key={i} className="h-4.5 w-4.5 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-550 dark:text-slate-300 italic mb-6 leading-relaxed">
                  "{test.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-darkbg-border">
                <img src={test.pic} alt={test.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h5 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">{test.name}</h5>
                  <span className="text-xs text-slate-450 dark:text-slate-450">{test.role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-darkbg-border/60">
        <div className="text-center mb-16">
          <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Choose the plan that suits your personal speech goals or institutional scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Basic */}
          <Card hoverEffect={true} variant="glass" className="flex flex-col justify-between text-left">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learner</span>
              <h4 className="font-display font-black text-2xl text-slate-800 dark:text-white mt-1">Starter</h4>
              <div className="my-6">
                <span className="font-display font-black text-4xl text-slate-950 dark:text-white">$0</span>
                <span className="text-slate-400 text-sm"> / forever</span>
              </div>
              <hr className="border-slate-100 dark:border-darkbg-border mb-6" />
              <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">✓ AI debate rounds (3 per month)</li>
                <li className="flex items-center gap-2">✓ Standard fallacy cards dictionary</li>
                <li className="flex items-center gap-2">✓ Video presentation upload (2 min limit)</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </Card>

          {/* Card 2: Pro */}
          <Card hoverEffect={true} variant="deep" glow={true} className="flex flex-col justify-between text-left relative ring-2 ring-indigo-500/50">
            <span className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">
              Popular
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-650 dark:text-brand-400 uppercase tracking-widest">Debater</span>
              <h4 className="font-display font-black text-2xl text-slate-800 dark:text-white mt-1">Premium Pro</h4>
              <div className="my-6">
                <span className="font-display font-black text-4xl text-slate-950 dark:text-white">$19</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <hr className="border-slate-100 dark:border-darkbg-border mb-6" />
              <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-350">
                <li className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">✓ Unlimited AI coach debate rounds</li>
                <li className="flex items-center gap-2">✓ Multi-format debate sessions</li>
                <li className="flex items-center gap-2">✓ Full presentation speed & fillers analysis</li>
                <li className="flex items-center gap-2">✓ Logical fallacy checker tools</li>
                <li className="flex items-center gap-2">✓ Rebuttal export (PDF/Excel)</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8">
              <Button variant="primary" className="w-full">Upgrade to Pro</Button>
            </Link>
          </Card>

          {/* Card 3: Enterprise */}
          <Card hoverEffect={true} variant="glass" className="flex flex-col justify-between text-left">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">School / Club</span>
              <h4 className="font-display font-black text-2xl text-slate-800 dark:text-white mt-1">Institutional</h4>
              <div className="my-6">
                <span className="font-display font-black text-4xl text-slate-950 dark:text-white">$89</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <hr className="border-slate-100 dark:border-darkbg-border mb-6" />
              <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">✓ Includes Educator Dashboard</li>
                <li className="flex items-center gap-2">✓ Roster tracking up to 50 students</li>
                <li className="flex items-center gap-2">✓ Class assignments & heatmaps</li>
                <li className="flex items-center gap-2">✓ SLA Support & custom API configs</li>
              </ul>
            </div>
            <Link to="/signup" className="mt-8">
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/40 dark:border-darkbg-border/60">
        <div className="text-center mb-12">
          <h3 className="font-display font-extrabold text-3xl md:text-5xl mb-4 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="rounded-2xl glass-panel border border-slate-200/30 dark:border-white/5 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 font-display font-bold text-sm md:text-base flex items-center justify-between text-slate-800 dark:text-slate-100 hover:bg-slate-100/40 dark:hover:bg-darkbg-accent/40 transition-colors"
                >
                  {faq.q}
                  <IoChevronDown className={`h-5 w-5 text-slate-450 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-450 leading-relaxed border-t border-slate-150/30 dark:border-darkbg-border/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="border-t border-slate-200/50 dark:border-darkbg-border bg-white dark:bg-darkbg-card py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-md font-bold shadow-md">
                🧠
              </div>
              <span className="font-display font-extrabold text-base text-slate-850 dark:text-white">DebateIQ AI</span>
            </div>
            <p className="text-xs text-slate-450 dark:text-slate-450 max-w-xs leading-relaxed">
              Elevating verbal reasoning and communication skills using generative AI.
            </p>
          </div>
          <div>
            <h5 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-450">
              <li><a href="#features" className="hover:text-indigo-650 dark:hover:text-white">AI Debate Arena</a></li>
              <li><a href="#features" className="hover:text-indigo-650 dark:hover:text-white">Speech Analysis</a></li>
              <li><a href="#features" className="hover:text-indigo-650 dark:hover:text-white">Logical fallacies</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-450">
              <li><a href="#" className="hover:text-indigo-650 dark:hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-650 dark:hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-650 dark:hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wider">Legal</h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-450">
              <li><a href="#" className="hover:text-indigo-650 dark:hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-650 dark:hover:text-white">Terms of Use</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 dark:border-darkbg-border pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© 2026 DebateIQ AI. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex gap-4">
            <span>Powered by Gemini AI</span>
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
