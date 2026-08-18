import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  FolderPlus,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  FileQuestion,
  Tag
} from 'lucide-react';
import { DocumentCard } from '../../components/documents/DocumentCard';
import { DocumentTable } from '../../components/documents/DocumentTable';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { NewFolderModal } from '../../components/modals/NewFolderModal';
import { RenameModal } from '../../components/modals/RenameModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';
import { getExpiryStatus } from '../../utils/formatters';

export const DocumentsPage = () => {
  const { documents, updateDocument, deleteDocument } = useDocuments();
  const { onOpenUpload, onShare } = useOutletContext();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name' | 'expiry' | 'size'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [renameDoc, setRenameDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);

  // Check if expiring filter is in URL
  const filterParam = searchParams.get('filter');

  const categories = ['All', 'Personal', 'Identity', 'Education', 'Finance', 'Insurance', 'Work', 'Other'];

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        // Expiry URL filter
        if (filterParam === 'expiring') {
          const status = getExpiryStatus(doc.expiryDate).status;
          if (status !== 'expiring') return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && doc.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = doc.name.toLowerCase().includes(q);
          const matchesTitle = doc.title && doc.title.toLowerCase().includes(q);
          const matchesDesc = doc.description && doc.description.toLowerCase().includes(q);
          const matchesTag = doc.tags && doc.tags.some(t => t.toLowerCase().includes(q));
          return matchesName || matchesTitle || matchesDesc || matchesTag;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        if (sortBy === 'expiry') {
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        }
        return 0;
      });
  }, [documents, selectedCategory, searchQuery, sortBy, filterParam]);

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
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage, verify, track expiration, and share all your important documents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            icon={FolderPlus}
            onClick={() => setIsNewFolderOpen(true)}
          >
            New Folder
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onOpenUpload}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* 2. Filter, Search & View Switcher Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search documents by name, category, or tag..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls: Sort and Grid/List toggle */}
          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="expiry">Expiry Date</option>
                <option value="size">File Size</option>
              </select>
            </div>

            {/* Grid / List view toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (filterParam) setSearchParams({});
              }}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat && !filterParam
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}

          {filterParam === 'expiring' && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-medium text-xs flex items-center gap-1">
              Filtering: Expiring Soon
              <button onClick={() => setSearchParams({})} className="ml-1 hover:text-amber-100">
                &times;
              </button>
            </span>
          )}
        </div>
      </div>

      {/* 3. Document Collection */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No documents match your filters"
          description="Try changing your search query or category filter, or upload a new document to your vault."
          actionLabel="Upload Document"
          onAction={onOpenUpload}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onShare={onShare}
              onRename={doc => setRenameDoc(doc)}
              onDelete={doc => setDeleteDoc(doc)}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onShare={onShare}
          onRename={doc => setRenameDoc(doc)}
          onDelete={doc => setDeleteDoc(doc)}
        />
      )}

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
      />

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
          message={`Are you sure you want to permanently delete "${deleteDoc.name}"?`}
        />
      )}
    </div>
  );
};
