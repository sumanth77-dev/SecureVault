import React from 'react';
import {
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  FileCheck2,
  File,
  Shield,
  Award
} from 'lucide-react';

export const FileIcon = ({ fileType = 'pdf', size = 'md', className = '' }) => {
  const type = (fileType || '').toLowerCase();

  const sizeDimensions = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-14 h-14 p-3',
    xl: 'w-20 h-20 p-4'
  }[size] || 'w-10 h-10 p-2';

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 28,
    xl: 38
  }[size] || 20;

  if (type === 'pdf') {
    return (
      <div className={`rounded-xl bg-red-50 text-red-600 border border-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
        <FileText size={iconSizes} strokeWidth={2} />
      </div>
    );
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(type)) {
    return (
      <div className={`rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
        <FileImage size={iconSizes} strokeWidth={2} />
      </div>
    );
  }

  if (['doc', 'docx', 'txt', 'rtf'].includes(type)) {
    return (
      <div className={`rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
        <FileText size={iconSizes} strokeWidth={2} />
      </div>
    );
  }

  if (['xls', 'xlsx', 'csv'].includes(type)) {
    return (
      <div className={`rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
        <FileSpreadsheet size={iconSizes} strokeWidth={2} />
      </div>
    );
  }

  if (['zip', 'rar', 'tar', '7z'].includes(type)) {
    return (
      <div className={`rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
        <FileArchive size={iconSizes} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 ${sizeDimensions} ${className}`}>
      <File size={iconSizes} strokeWidth={2} />
    </div>
  );
};
