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

  const statusColors: Record<string, string> = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debate Sessions</h1>
          <p className="text-gray-500 mt-1">View and manage your debate sessions</p>
        </div>
        <Link to="/debates/create" className="btn-primary">
          + New Debate
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      ) : debates.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 mb-4">No debate sessions yet</p>
          <Link to="/debates/create" className="btn-primary">
            Create Your First Debate
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {debates.map((d) => (
            <Link
              key={d.id}
              to={`/debates/${d.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{d.topic}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                    <span>Format: {d.format.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{d.duration_minutes} min</span>
                    {d.scheduled_at && (
                      <>
                        <span>•</span>
                        <span>{new Date(d.scheduled_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusColors[d.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {d.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebateList;

