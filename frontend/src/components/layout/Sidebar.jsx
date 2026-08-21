import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderClosed,
  Share2,
  Bell,
  Settings,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Plus
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useDocuments } from '../../context/DocumentContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenUpload }) => {
  const { unreadCount } = useNotifications();
  const { metrics } = useDocuments();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText, count: metrics.totalDocs },
    { name: 'Folders', path: '/folders', icon: FolderClosed, count: metrics.totalFolders },
    { name: 'Shared', path: '/shared', icon: Share2, count: metrics.totalShared },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                SecureVault
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
                Personal Vault
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Upload Button */}
      <div className="p-3">
        {isCollapsed ? (
          <button
            onClick={onOpenUpload}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm shadow-blue-500/30 transition-colors"
            title="Upload Document"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/25 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.badge === undefined && (
                    <span className="text-xs text-slate-400 font-normal">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Storage Gauge */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Vault Storage
            </span>
            <span className="text-slate-500 font-medium">
              {metrics.storagePercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metrics.storagePercentage > 85 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${metrics.storagePercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{metrics.storageUsedMB} MB used</span>
            <span>1 GB Max</span>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            } ${isCollapsed ? 'justify-center px-0' : ''}`
          }
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            } ${isCollapsed ? 'justify-center' : ''}`
          }
        >
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Vault
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
