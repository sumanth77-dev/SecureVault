import React, { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  FolderClosed,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  HardDrive,
  Clock,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { NewFolderModal } from '../../components/modals/NewFolderModal';
import { RenameModal } from '../../components/modals/RenameModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

export const FoldersPage = () => {
  const { folders, documents, renameFolder, deleteFolder, updateDocument, deleteDocument } = useDocuments();
  const { onOpenUpload, onShare } = useOutletContext();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [docRename, setDocRename] = useState(null);
  const [docDelete, setDocDelete] = useState(null);

  // Selected folder for drilldown
  const selectedSlug = searchParams.get('selected');
  const activeFolder = selectedSlug ? folders.find(f => f.slug === selectedSlug || f.id === selectedSlug) : null;

  const folderDocuments = activeFolder
    ? documents.filter(d => d.folderId === activeFolder.id || d.category.toLowerCase() === activeFolder.slug)
    : [];

  const handleRenameFolder = (newName) => {
    if (renameTarget) {
      renameFolder(renameTarget.id, newName);
      showToast(`Renamed folder to "${newName}".`, 'success');
      setRenameTarget(null);
    }
  };

  const handleDeleteFolder = () => {
    if (deleteTarget) {
      deleteFolder(deleteTarget.id);
      showToast(`Deleted folder "${deleteTarget.name}".`, 'info');
      setDeleteTarget(null);
      if (selectedSlug) setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* If in Drilldown View */}
      {activeFolder ? (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchParams({})}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs text-slate-400">Folders /</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeFolder.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeFolder.description} &bull; {folderDocuments.length} documents &bull; {activeFolder.sizeMB} MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={Edit2} onClick={() => setRenameTarget(activeFolder)}>
                Rename
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={onOpenUpload}>
                Upload to Folder
              </Button>
            </div>
          </div>

          {/* Folder's Documents */}
          {folderDocuments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={`No documents in "${activeFolder.name}"`}
              description="Upload certificates, policies or PDFs to categorize them in this folder."
              actionLabel="Upload Document"
              onAction={onOpenUpload}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {folderDocuments.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onShare={onShare}
                  onRename={d => setDocRename(d)}
                  onDelete={d => setDocDelete(d)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Standard All Folders View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Folders
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Organize your documents into structured categories and workspaces.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={FolderPlus}
              onClick={() => setIsNewFolderOpen(true)}
            >
              New Folder
            </Button>
          </div>

          {/* Folders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {folders.map(folder => {
              const count = documents.filter(d => d.folderId === folder.id || d.category.toLowerCase() === folder.slug).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setSearchParams({ selected: folder.slug })}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-xs group-hover:scale-105 transition-transform">
                      <FolderClosed className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setRenameTarget(folder)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(folder)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="my-4 space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {folder.description || 'Dedicated workspace collection'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {count} {count === 1 ? 'document' : 'documents'}
                    </span>
                    <span>{folder.sizeMB} MB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
      />

      {/* Rename Folder Modal */}
      {renameTarget && (
        <RenameModal
          isOpen={Boolean(renameTarget)}
          onClose={() => setRenameTarget(null)}
          initialName={renameTarget.name}
          onRename={handleRenameFolder}
          title="Rename Folder"
        />
      )}

      {/* Delete Folder Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteFolder}
          title="Delete Folder"
          message={`Are you sure you want to delete folder "${deleteTarget.name}"? Existing documents will be safely retained under Personal category.`}
        />
      )}

      {/* Document sub modals */}
      {docRename && (
        <RenameModal
          isOpen={Boolean(docRename)}
          onClose={() => setDocRename(null)}
          initialName={docRename.name}
          onRename={name => {
            updateDocument(docRename.id, { name });
            showToast(`Renamed to "${name}".`, 'success');
            setDocRename(null);
          }}
          title="Rename Document"
        />
      )}

      {docDelete && (
        <ConfirmDialog
          isOpen={Boolean(docDelete)}
          onClose={() => setDocDelete(null)}
          onConfirm={() => {
            deleteDocument(docDelete.id);
            showToast(`Deleted "${docDelete.name}".`, 'info');
            setDocDelete(null);
          }}
          title="Delete Document"
          message={`Are you sure you want to permanently delete "${docDelete.name}"?`}
        />
      )}
    </div>
  );
};
