import React from 'react';
import {
  UploadCloud,
  Download,
  Share2,
  AlertTriangle,
  Trash2,
  Shield,
  FolderPlus,
  Clock
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { timeAgo } from '../../utils/formatters';

export const RecentActivityFeed = () => {
  const { activities } = useDocuments();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload':
        return { icon: UploadCloud, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60' };
      case 'download':
        return { icon: Download, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60' };
      case 'share':
        return { icon: Share2, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60' };
      case 'alert':
        return { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' };
      case 'delete':
        return { icon: Trash2, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60' };
      case 'security':
        return { icon: Shield, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60' };
      default:
        return { icon: FolderPlus, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Vault Activity</h3>
        </div>
        <span className="text-xs text-slate-400">Audit Stream</span>
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map(act => {
          const { icon: Icon, color } = getActivityIcon(act.type);
          return (
            <div key={act.id} className="flex items-start gap-3.5 text-xs">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </p>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {timeAgo(act.timestamp)}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
