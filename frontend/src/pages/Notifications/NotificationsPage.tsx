import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../../api/client';
import type { Notification } from '../../types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI
      .list()
      .then((res) => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch {
      alert('Failed to mark notifications as read.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'eval':
      case 'score':
        return '📊';
      case 'debate':
        return '🎯';
      case 'coaching':
        return '💡';
      case 'alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              🔔 Notifications & System Alerts
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Activity Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-agent pipeline notifications, speech evaluation scorecards, and coaching milestones.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllAsRead} className="btn-secondary text-xs py-2 px-4 self-start sm:self-auto">
            ✓ Mark All As Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-xs text-slate-500">Loading System Activity Stream...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-3xl flex items-center justify-center mx-auto text-indigo-600">
            🔔
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No active notifications</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              You are all caught up! New debate evaluations, sparring milestones, and coaching tips will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                n.is_read
                  ? 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-indigo-50/70 border-indigo-200 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                  {getNotificationIcon(n.notification_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs capitalize text-indigo-700">
                        {n.notification_type.replace(/_/g, ' ')}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      Channel: {n.channel}
                    </span>
                    {!n.is_read && (
                      <span className="text-[10px] text-indigo-700 font-bold ml-auto">
                        New Alert
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

