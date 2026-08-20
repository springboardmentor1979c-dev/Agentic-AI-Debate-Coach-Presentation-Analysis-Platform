import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { debatesAPI } from '../../api/client';
import type { DebateSession } from '../../types';

const DebateList: React.FC = () => {
  const [debates, setDebates] = useState<DebateSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debatesAPI
      .list()
      .then((res) => setDebates(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatLabels: Record<string, string> = {
    one_on_one: '1-on-1 Direct Debate',
    parliamentary: 'Parliamentary Style',
    oxford: 'Oxford Union Style',
    policy: 'Policy Cross-Examination',
    public_forum: 'Public Forum',
    ai_simulation: 'AI Agent Simulation',
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              🎯 Structured Debate Rounds
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Formal Sessions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse active and archived debate rounds evaluated against standard parliamentary & collegiate rubrics.
          </p>
        </div>

        <Link to="/debates/create" className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm">
          + Create New Debate Session
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-xs text-slate-500">Loading debate sessions from database...</p>
        </div>
      ) : debates.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-3xl flex items-center justify-center mx-auto text-indigo-600">
            🎯
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No debate sessions recorded</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Create your first debate round to start generating argument arguments, fallacy reports, and scoring rubrics.
            </p>
          </div>
          <Link to="/debates/create" className="btn-primary text-xs py-2.5 px-5 shadow-sm">
            Launch Your First Debate Round →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {debates.map((d) => (
            <Link
              key={d.id}
              to={`/debates/${d.id}`}
              className="card group hover:border-indigo-300 p-5 transition-all duration-200 block"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                      ID #{d.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {formatLabels[d.format] || d.format}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {d.topic}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      ⏱️ {d.duration_minutes} minutes
                    </span>
                    {d.scheduled_at && (
                      <span className="flex items-center gap-1">
                        📅 {new Date(d.scheduled_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
                      d.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : d.status === 'active'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {d.status}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all font-semibold">
                    Open Session →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebateList;


