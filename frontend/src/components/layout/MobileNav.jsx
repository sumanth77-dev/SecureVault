import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderClosed,
  Share2,
  Bell,
  User,
  Plus,
  X,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const MobileDrawer = ({ isOpen, onClose, onOpenUpload }) => {
  const { unreadCount } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">SecureVault</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Documents', path: '/documents', icon: FileText },
            { name: 'Folders', path: '/folders', icon: FolderClosed },
            { name: 'Shared Documents', path: '/shared', icon: Share2 },
            { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
            { name: 'Profile', path: '/profile', icon: User },
            { name: 'Settings', path: '/settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export const MobileBottomBar = ({ onOpenUpload }) => {
  const { unreadCount } = useNotifications();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-30">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/documents"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <FileText className="w-5 h-5" />
        <span>Docs</span>
      </NavLink>

      {/* Floating Upload Button */}
      <button
        onClick={onOpenUpload}
        className="w-11 h-11 -mt-5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NavLink
        to="/shared"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Share2 className="w-5 h-5" />
        <span>Shared</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 text-[10px] font-medium ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`
        }
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-rose-500"></span>
        )}
        <span>Alerts</span>
      </NavLink>
    </div>
  );
};
