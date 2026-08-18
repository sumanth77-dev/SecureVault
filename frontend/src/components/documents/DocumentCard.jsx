import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Star,
  Eye,
  Share2,
  Download,
  Edit2,
  Trash2,
  Calendar,
  Lock,
  Tag
} from 'lucide-react';
import { FileIcon } from '../common/FileIcon';
import { StatusBadge } from '../common/StatusBadge';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

export const DocumentCard = ({ document: doc, onShare, onRename, onDelete }) => {
  const navigate = useNavigate();
  const { toggleStarDocument } = useDocuments();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (e) => {
    e.stopPropagation();
    showToast(`Downloading "${doc.name}"...`, 'info');
    setTimeout(() => {
      showToast(`Downloaded "${doc.name}" successfully.`, 'success');
    }, 1000);
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={() => navigate(`/documents/${doc.id}`)}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-700/80 transition-all cursor-pointer group flex flex-col justify-between relative"
    >
      {/* Top row: Icon, Star, and 3-dot Menu */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <FileIcon fileType={doc.fileType} size="md" />

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => toggleStarDocument(doc.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              doc.isStarred
                ? 'text-amber-400 hover:text-amber-500'
                : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 opacity-0 group-hover:opacity-100'
            }`}
            title={doc.isStarred ? 'Unstar' : 'Star'}
          >
            <Star className="w-4 h-4" fill={doc.isStarred ? 'currentColor' : 'none'} />
          </button>

          {/* 3-dot menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate(`/documents/${doc.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onShare(doc);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Link
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRename(doc);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Rename
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(doc);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Name & Category */}
      <div className="space-y-1 my-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {doc.name}
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
            {doc.category}
          </span>
          <span>&bull;</span>
          <span>{doc.sizeFormatted}</span>
        </div>
      </div>

      {/* Bottom: Expiry & Status */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <StatusBadge status={doc.status} expiryDate={doc.expiryDate} size="sm" />
        <span className="text-[11px] text-slate-400">
          {formatDate(doc.uploadedAt)}
        </span>
      </div>
    </div>
  );
};
