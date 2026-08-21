import React, { useState } from 'react';
import { useOutletContext, useNavigate, NavLink } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  HardDrive,
  AlertTriangle,
  FolderClosed,
  ChevronRight
} from 'lucide-react';
import { StatCards } from '../../components/dashboard/StatCards';
import { StorageChart } from '../../components/dashboard/StorageChart';
import { ExpiringSoonList } from '../../components/dashboard/ExpiringSoonList';
import { RecentActivityFeed } from '../../components/dashboard/RecentActivityFeed';
import { DocumentTable } from '../../components/documents/DocumentTable';
import { RenameModal } from '../../components/modals/RenameModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { documents, updateDocument, deleteDocument } = useDocuments();
  const { onOpenUpload, onShare } = useOutletContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);

  const recentDocs = documents.slice(0, 5);

  const handleConfirmDelete = () => {
    if (deleteDoc) {
      deleteDocument(deleteDoc.id);
      showToast(`Deleted "${deleteDoc.name}".`, 'info');
      setDeleteDoc(null);
    }
  };

  const handleRename = (newName) => {
    if (renameDoc) {
      updateDocument(renameDoc.id, { name: newName });
      showToast(`Renamed to "${newName}".`, 'success');
      setRenameDoc(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with greeting and Upload CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good morning, {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your documents and renewal timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onOpenUpload}
            className="shadow-sm shadow-blue-500/25"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* 2. Stat KPIs */}
      <StatCards />

      {/* 3. Middle row: Storage Breakdown Donut & Expiring Soon side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <StorageChart />
        </div>
        <div className="lg:col-span-6">
          <ExpiringSoonList />
        </div>
      </div>

      {/* 4. Recent Documents Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Documents
            </h3>
          </div>
          <NavLink
            to="/documents"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({documents.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <DocumentTable
          documents={recentDocs}
          onShare={onShare}
          onRename={doc => setRenameDoc(doc)}
          onDelete={doc => setDeleteDoc(doc)}
        />
      </div>

      {/* 5. Recent Activity Feed */}
      <RecentActivityFeed />

      {/* Rename Modal */}
      {renameDoc && (
        <RenameModal
          isOpen={Boolean(renameDoc)}
          onClose={() => setRenameDoc(null)}
          initialName={renameDoc.name}
          onRename={handleRename}
          title="Rename Document"
        />
      )}

      {/* Delete Confirmation */}
      {deleteDoc && (
        <ConfirmDialog
          isOpen={Boolean(deleteDoc)}
          onClose={() => setDeleteDoc(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Document"
          message={`Are you sure you want to permanently delete "${deleteDoc.name}"? This action will remove it from your vault.`}
        />
      )}
    </div>
  );
};
