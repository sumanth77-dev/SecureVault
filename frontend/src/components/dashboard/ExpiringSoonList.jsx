import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ChevronRight, FileText, Calendar } from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { FileIcon } from '../common/FileIcon';
import { formatDate, getDaysRemaining } from '../../utils/formatters';

export const ExpiringSoonList = () => {
  const { metrics } = useDocuments();
  const navigate = useNavigate();

  const expiringDocs = metrics.expiringSoonDocs;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expiring Soon</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold">
          {expiringDocs.length} pending
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 my-2">
        {expiringDocs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No documents expiring within the next 45 days.
          </div>
        ) : (
          expiringDocs.map(doc => {
            const daysLeft = getDaysRemaining(doc.expiryDate);
            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 p-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon fileType={doc.fileType} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {doc.category} &bull; Exp: {formatDate(doc.expiryDate)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                      daysLeft <= 7
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {daysLeft} days
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <NavLink
          to="/documents?filter=expiring"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between"
        >
          <span>View Expiry Radar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    </div>
  );
};
