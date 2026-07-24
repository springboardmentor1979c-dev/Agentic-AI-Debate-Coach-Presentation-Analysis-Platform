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

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'reminder': return '⏰';
      case 'alert': return '⚠️';
      case 'milestone': return '🏆';
      default: return '📌';
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'reminder': return 'bg-yellow-50 border-yellow-200';
      case 'alert': return 'bg-red-50 border-red-200';
      case 'milestone': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };


  const handleMarkRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔔 Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated with your debate activity</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`card border-2 cursor-pointer transition-all ${getBgColor(n.notification_type)} ${!n.is_read ? 'ring-2 ring-brand-400 hover:ring-brand-500' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(n.notification_type)}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{n.title}</h3>
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {n.channel}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{n.notification_type}</span>
                    {!n.is_read && (
                      <span className="text-xs text-brand-600 ml-auto">Click to mark as read</span>
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

