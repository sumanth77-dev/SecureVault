import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock, CheckCircle2, Lock } from 'lucide-react';
import { getExpiryStatus } from '../../utils/formatters';

export const StatusBadge = ({ status, expiryDate, size = 'md', showIcon = true }) => {
  let resolvedStatus = status;
  let label = '';
  let color = 'emerald';

  if (expiryDate !== undefined) {
    const statusInfo = getExpiryStatus(expiryDate);
    resolvedStatus = statusInfo.status;
    label = statusInfo.label;
    color = statusInfo.color;
  } else {
    if (status === 'valid' || status === 'active') {
      label = 'Valid';
      color = 'emerald';
    } else if (status === 'expiring') {
      label = 'Expiring Soon';
      color = 'amber';
    } else if (status === 'expired') {
      label = 'Expired';
      color = 'rose';
    } else if (status === 'revoked') {
      label = 'Revoked';
      color = 'slate';
    } else {
      label = status || 'Valid';
      color = 'blue';
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-medium'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700'
  }[color] || colorClasses.slate;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && (
        <>
          {resolvedStatus === 'valid' || resolvedStatus === 'active' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : resolvedStatus === 'expiring' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          ) : resolvedStatus === 'expired' ? (
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
          )}
        </>
      )}
      <span>{label}</span>
    </span>
  );
};
