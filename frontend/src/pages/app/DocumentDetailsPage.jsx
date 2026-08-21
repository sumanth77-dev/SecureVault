import React, { useState } from 'react';
import { useParams, useNavigate, NavLink, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Tag,
  History,
  Activity,
  CheckCircle2,
  HardDrive,
  Layers,
  Eye
} from 'lucide-react';
import { DocumentPreviewCanvas } from '../../components/common/DocumentPreviewCanvas';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { RenameModal } from '../../components/modals/RenameModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';
import { formatDate, formatDateTime, timeAgo } from '../../utils/formatters';
import { documentService } from '../../services/documentService';

export const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument, deleteDocument } = useDocuments();
  const { onShare } = useOutletContext();
  const { showToast } = useToast();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'versions'

  const document = documents.find(d => d.id === id);

  if (!document) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold">Document Not Found</h2>
        <p className="text-sm text-slate-500">The requested document could not be located in your vault.</p>
        <NavLink to="/documents">
          <Button variant="primary">Return to Documents</Button>
        </NavLink>
      </div>
    );
  }

  const handlePreview = async () => {
    showToast(`Opening preview for "${document.name}"...`, 'info');
    try {
      if (document.id) {
        const res = await documentService.getPreviewUrl(document.id);
        if (res?.previewUrl) {
          window.open(res.previewUrl, '_blank');
          return;
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to open document preview.', 'error');
    }
  };

  const handleDownload = async () => {
    showToast(`Generating secure download for "${document.name}"...`, 'info');
    try {
      if (document.id) {
        const res = await documentService.getDownloadUrl(document.id);
        if (res?.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
          showToast(`Downloaded "${document.name}" successfully.`, 'success');
          return;
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to download document.', 'error');
    }
  };

  const handleRename = (newName) => {
    updateDocument(document.id, { name: newName });
    showToast(`Renamed to "${newName}".`, 'success');
  };

  const handleDelete = () => {
    deleteDocument(document.id);
    showToast(`Deleted "${document.name}".`, 'info');
    navigate('/documents');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Back to Documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Documents / {document.category} /</span>
              <StatusBadge status={document.status} expiryDate={document.expiryDate} size="sm" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
              {document.name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon={Eye} onClick={handlePreview}>
            View
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>
            Download
          </Button>
          <Button variant="primary" size="sm" icon={Share2} onClick={() => onShare(document)}>
            Share Securely
          </Button>
          <Button variant="secondary" size="sm" icon={Edit2} onClick={() => setIsRenameOpen(true)}>
            Rename
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* 2. Main Grid: Left = Large Preview, Right = Metadata & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Preview Pane */}
        <div className="lg:col-span-7 bg-slate-100/70 dark:bg-slate-900/60 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
          <DocumentPreviewCanvas document={document} />
        </div>

        {/* Right Metadata Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Document Information
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Document Title</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right truncate max-w-[200px]">
                  {document.title || document.name}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Category</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 font-medium">
                  {document.category}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">File Size</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                  {document.sizeFormatted}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Uploaded On</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDate(document.uploadedAt)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Expiry Date</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {document.expiryDate ? formatDate(document.expiryDate) : 'No Expiry Set'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={document.status} expiryDate={document.expiryDate} size="sm" />
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-500 block mb-1">Notes &amp; Description</label>
              <p className="text-xs text-slate-600 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 leading-relaxed">
                {document.description || 'No specific description provided during upload.'}
              </p>
            </div>

            {/* Tags */}
            {document.tags && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Security Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {document.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Tabs: Document Activity & Version History */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Tab Headers */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 text-sm font-bold pb-1 transition-all ${
              activeTab === 'activity'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Document Activity ({document.activityLog?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 text-sm font-bold pb-1 transition-all ${
              activeTab === 'versions'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Version History ({document.versions?.length || 1})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' ? (
          <div className="space-y-3">
            {document.activityLog && document.activityLog.length > 0 ? (
              document.activityLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-slate-400">Initiated by {log.user || 'Sumanth'}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No recent activity on this document.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {document.versions && document.versions.map((ver, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                    {ver.version}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{ver.notes}</p>
                    <p className="text-slate-400">Saved on {ver.date} &bull; {ver.size}</p>
                  </div>
                </div>

                <Button variant="ghost" size="xs" icon={Download} onClick={handleDownload}>
                  Download {ver.version}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        initialName={document.name}
        onRename={handleRename}
        title="Rename Document"
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${document.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
