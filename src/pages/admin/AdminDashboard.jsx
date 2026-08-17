import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  IoSettings, IoServer, IoCodeWorking, IoTrendingUp, 
  IoPulse, IoCash, IoShieldCheckmark, IoWarning 
} from 'react-icons/io5';

const AdminDashboard = () => {
  const [logs, setLogs] = useState([
    "[21:28:10] INFO: Auth session validated for user alex.mercer@gmail.com",
    "[21:27:55] INFO: LLM request dispatched to argument-analyzer-v3 - latency 210ms",
    "[21:26:04] WARN: High memory usage threshold detected on worker-node-2",
    "[21:24:12] SUCCESS: Presentation audio upload parsed (4.2MB video format)",
  ]);

  // Periodic log simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        `[${new Date().toLocaleTimeString()}] INFO: API route GET /api/v1/coaching hit by usr_10293`,
        `[${new Date().toLocaleTimeString()}] SUCCESS: Fallacy checks finished on UBI speech brief`,
        `[${new Date().toLocaleTimeString()}] INFO: MRR webhook received from Stripe billing provider`,
        `[${new Date().toLocaleTimeString()}] DEBUG: Cleared notification cache log buffer`
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [randomMsg, ...prev.slice(0, 7)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const models = [
    { name: "Argument-Extraction-v3", version: "v3.0.4", status: "Healthy", latency: "210ms", load: "42%" },
    { name: "Pace-Auditor-v2", version: "v2.1.0", status: "Healthy", latency: "140ms", load: "18%" },
    { name: "Fallacy-Scanner-v3", version: "v3.1.2", status: "Healthy", latency: "310ms", load: "64%" },
    { name: "Tone-Sentiment-v1", version: "v1.0.8", status: "Degraded", latency: "840ms", load: "92%" },
  ];

  const revData = [
    { name: 'Feb', revenue: 2400 },
    { name: 'Mar', revenue: 3800 },
    { name: 'Apr', revenue: 4200 },
    { name: 'May', revenue: 5900 },
    { name: 'Jun', revenue: 7100 },
    { name: 'Jul', revenue: 8420 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          Admin Console
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor active AI model status healths, platform API traffic, and monthly revenue.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Active Accounts", value: "412 Users", icon: IoPulse, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { name: "Total API Requests", value: "12,840 calls", icon: IoCodeWorking, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
          { name: "Average Latency", value: "240 ms", icon: IoServer, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/20" },
          { name: "Monthly Revenue (MRR)", value: "$8,420", icon: IoCash, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
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

      {/* Model status & Revenue */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Model status */}
        <Card variant="glass" className="lg:col-span-2" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">LLM Model Status Nodes</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">4 Node Clusters</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] text-slate-450 font-bold border-b border-slate-200/40 dark:border-darkbg-border pb-3 uppercase">
                  <th className="pb-3">Model Service</th>
                  <th className="pb-3">Version</th>
                  <th className="pb-3">Latency</th>
                  <th className="pb-3">Compute Load</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkbg-border">
                {models.map((model, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-darkbg-accent/10">
                    <td className="py-4 font-bold text-slate-850 dark:text-slate-200">{model.name}</td>
                    <td className="py-4 text-slate-550">{model.version}</td>
                    <td className="py-4 text-slate-550 font-mono">{model.latency}</td>
                    <td className="py-4 text-slate-450 font-semibold">{model.load}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        model.status === "Healthy" ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                      }`}>
                        {model.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Revenue Growth MRR */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Revenue Growth</h3>
              <p className="text-[10px] text-slate-450">MRR expansion last 6 months</p>
            </div>
            <IoTrendingUp className="text-emerald-500" />
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" tickLine={false} />
                <Tooltip contentStyle={{ background: '#0a0526', borderColor: '#1b124a', color: '#fff', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Logs Console stream */}
      <Card variant="deep" hoverEffect={false} className="border-l-4 border-l-slate-700">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
            Platform Logs Stream
          </h3>
          <span className="text-[10px] text-slate-450 font-semibold bg-slate-100 dark:bg-darkbg-accent px-2 py-0.5 rounded animate-pulse">
            LIVE MONITOR
          </span>
        </div>
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-[11px] space-y-2 h-44 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className={`${
              log.includes('WARN') ? 'text-amber-400' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-slate-350'
            }`}>
              {log}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
