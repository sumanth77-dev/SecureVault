import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../components/common/Toast';
import { timeAgo } from '../../utils/formatters';

export const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'security' | 'expiry' | 'activity'

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'security') return item.type === 'security';
    if (activeFilter === 'expiry') return item.type === 'expiry';
    if (activeFilter === 'activity') return item.type === 'activity';
    return true;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'security':
        return { icon: Shield, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60' };
      case 'expiry':
        return { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
      case 'activity':
        return { icon: Activity, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' };
      default:
        return { icon: Bell, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Notifications &amp; Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time security alerts, policy expiry notices, and share access activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCheck}
              onClick={() => {
                markAllAsRead();
                showToast('Marked all notifications as read.', 'success');
              }}
            >
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => {
                clearAll();
                showToast('Cleared all notifications.', 'info');
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'security', label: 'Security Alerts', count: notifications.filter(n => n.type === 'security').length },
          { id: 'expiry', label: 'Expiry Notices', count: notifications.filter(n => n.type === 'expiry').length },
          { id: 'activity', label: 'Share Activity', count: notifications.filter(n => n.type === 'activity').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === tab.id ? 'bg-blue-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Inbox Zero"
          description="You have no notifications matching this category. All systems and documents are secure."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(item => {
            const { icon: Icon, color } = getIconForType(item.type);
            return (
              <div
                key={item.id}
                onClick={() => {
                  markAsRead(item.id);
                  if (item.actionUrl) navigate(item.actionUrl);
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  !item.read
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {item.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
