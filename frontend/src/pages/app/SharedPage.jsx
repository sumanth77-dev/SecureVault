import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Share2,
  Lock,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  Eye,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';
import { formatDate, timeAgo } from '../../utils/formatters';

export const SharedPage = () => {
  const { sharedDocuments, revokeSharedLink } = useDocuments();
  const { showToast } = useToast();

  const [revokeTarget, setRevokeTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (share) => {
    const link = `${window.location.origin}/share/${share.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(share.id);
    showToast('Secure link copied to clipboard.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = () => {
    if (revokeTarget) {
      revokeSharedLink(revokeTarget.id);
      showToast('Document access link revoked.', 'info');
      setRevokeTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shared Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active sharing links, revoke access instantly, and review access logs.
          </p>
        </div>
      </div>

      {/* 2. Shares Table */}
      {sharedDocuments.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No shared links yet"
          description="Share a passport, certificate or policy securely using temporary password-protected links."
        />
      ) : (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 pl-4 sm:pl-6 pr-3">Document</th>
                  <th className="py-3.5 px-3">Shared With</th>
                  <th className="py-3.5 px-3 hidden md:table-cell">Created</th>
                  <th className="py-3.5 px-3">Expires</th>
                  <th className="py-3.5 px-3 hidden sm:table-cell">Security</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 sm:pr-6 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sharedDocuments.map(share => (
                  <tr
                    key={share.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Document Name */}
                    <td className="py-3.5 pl-4 sm:pl-6 pr-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[180px] sm:max-w-xs">{share.documentName}</span>
                      </div>
                    </td>

                    {/* Shared With */}
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      <div>
                        <p className="font-medium">{share.sharedWith}</p>
                        {share.recipientEmail && (
                          <p className="text-[11px] text-slate-400">{share.recipientEmail}</p>
                        )}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-3 hidden md:table-cell text-slate-500 dark:text-slate-400 text-xs">
                      {timeAgo(share.createdAt)}
                    </td>

                    {/* Expiry */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-xs">
                      {share.expiresAt ? formatDate(share.expiresAt) : 'Never'}
                    </td>

                    {/* Security Tags */}
                    <td className="py-3.5 px-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-xs">
                        {share.hasPassword ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center gap-1 text-[11px]">
                            <Lock className="w-3 h-3" /> Password
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Direct link</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          share.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : share.status === 'expired'
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {share.status === 'active' ? 'Active' : share.status === 'expired' ? 'Expired' : 'Revoked'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-4 sm:pr-6 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(share)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Copy secure link"
                        >
                          {copiedId === share.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>

                        <a
                          href={`/share/${share.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Open public portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {share.status === 'active' && (
                          <button
                            onClick={() => setRevokeTarget(share)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      {revokeTarget && (
        <ConfirmDialog
          isOpen={Boolean(revokeTarget)}
          onClose={() => setRevokeTarget(null)}
          onConfirm={handleRevoke}
          title="Revoke Shared Access"
          message={`Are you sure you want to immediately revoke access for "${revokeTarget.sharedWith}"? The link will cease functioning.`}
          confirmLabel="Revoke Access"
          confirmVariant="danger"
        />
      )}
    </div>
  );
};
