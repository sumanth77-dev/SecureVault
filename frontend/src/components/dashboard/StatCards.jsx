import React from 'react';
import { FileText, Folder, AlertTriangle, HardDrive, TrendingUp, ShieldCheck } from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';

export const StatCards = () => {
  const { metrics } = useDocuments();

  const cards = [
    {
      title: 'Total Documents',
      value: metrics.totalDocs,
      description: 'Indexed in encrypted vault',
      trend: '+4 this month',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Active Folders',
      value: metrics.totalFolders,
      description: 'Categorized workspaces',
      trend: '6 categories',
      icon: Folder,
      color: 'indigo'
    },
    {
      title: 'Expiring Soon',
      value: metrics.expiringSoonCount,
      description: 'Requires renewal within 45d',
      trend: metrics.expiringSoonCount > 0 ? 'Action required' : 'All up to date',
      icon: AlertTriangle,
      color: metrics.expiringSoonCount > 0 ? 'amber' : 'emerald',
      isWarning: metrics.expiringSoonCount > 0
    },
    {
      title: 'Storage Used',
      value: `${metrics.storageUsedMB} MB`,
      description: `of ${metrics.storageLimitMB} MB (1 GB Max)`,
      trend: `${metrics.storagePercentage}% allocated`,
      icon: HardDrive,
      color: 'slate'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group ${
              card.isWarning ? 'ring-1 ring-amber-500/30' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  card.color === 'blue'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                    : card.color === 'indigo'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50'
                    : card.color === 'amber'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 animate-pulse'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {card.description}
              </span>
              <span
                className={`font-semibold shrink-0 ${
                  card.isWarning
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
