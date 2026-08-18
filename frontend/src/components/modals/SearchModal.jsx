import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Folder,
  Share2,
  X,
  ArrowRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { FileIcon } from '../common/FileIcon';
import { StatusBadge } from '../common/StatusBadge';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { searchAll } = useDocuments();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown listener for ESC and Ctrl/Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle if handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchAll(query);
  const totalResults = results.documents.length + results.folders.length + results.shared.length;

  const handleSelectDoc = (docId) => {
    navigate(`/documents/${docId}`);
    onClose();
  };

  const handleSelectFolder = (folderSlug) => {
    navigate(`/folders?selected=${folderSlug}`);
    onClose();
  };

  const handleSelectShared = () => {
    navigate('/shared');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documents, folders, tags, or shared links (e.g. 'passport', 'tax', 'insurance')..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-slate-400 text-xs space-y-2">
              <div className="flex items-center justify-center gap-1 text-slate-500 font-medium">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Quick Search Tips</span>
              </div>
              <p>Type the name of any certificate, insurance policy, passport, tax receipt or tag.</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {['Passport', 'Insurance', 'Certificate', 'Tax', 'Degree'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No results matching "<span className="text-slate-900 dark:text-slate-100 font-medium">{query}</span>"
            </div>
          ) : (
            <>
              {/* Matched Documents */}
              {results.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Documents ({results.documents.length})
                  </h4>
                  <div className="space-y-1">
                    {results.documents.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectDoc(doc.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileIcon fileType={doc.fileType} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {doc.category} &bull; {doc.sizeFormatted}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={doc.status} expiryDate={doc.expiryDate} size="sm" />
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Folders */}
              {results.folders.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" /> Folders ({results.folders.length})
                  </h4>
                  <div className="space-y-1">
                    {results.folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => handleSelectFolder(folder.slug)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Folder className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {folder.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {folder.itemCount} documents &bull; {folder.sizeMB} MB
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Shared Links */}
              {results.shared.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Shared Links ({results.shared.length})
                  </h4>
                  <div className="space-y-1">
                    {results.shared.map(share => (
                      <button
                        key={share.id}
                        onClick={handleSelectShared}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {share.documentName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Shared with {share.sharedWith} &bull; {share.status}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search SecureVault Database</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" /> Encrypted Local Index
          </span>
        </div>
      </div>
    </div>
  );
};
