import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Star,
  Eye,
  Share2,
  Download,
  Edit2,
  Trash2
} from 'lucide-react';
import { FileIcon } from '../common/FileIcon';
import { StatusBadge } from '../common/StatusBadge';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../common/Toast';
import { formatDate } from '../../utils/formatters';
import { documentService } from '../../services/documentService';

export const DocumentTable = ({ documents, onShare, onRename, onDelete }) => {
  const navigate = useNavigate();
  const { toggleStarDocument } = useDocuments();
  const { showToast } = useToast();
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);

  const handlePreview = async (e, doc) => {
    e.stopPropagation();
    try {
      showToast(`Opening preview for "${doc.name}"...`, 'info');
      const res = await documentService.getPreviewUrl(doc.id);
      if (res?.previewUrl) {
        window.open(res.previewUrl, '_blank');
      }
    } catch (err) {
      showToast(err.message || 'Failed to open preview.', 'error');
    }
  };

  const handleDownload = async (e, doc) => {
    e.stopPropagation();
    try {
      showToast(`Downloading "${doc.name}"...`, 'info');
      const res = await documentService.getDownloadUrl(doc.id);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
        showToast(`Downloaded "${doc.name}" successfully.`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to download document.', 'error');
    }
    setActiveMenuDocId(null);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 pl-4 sm:pl-6 pr-2 w-10"></th>
              <th className="py-3.5 px-3">Document</th>
              <th className="py-3.5 px-3 hidden md:table-cell">Category</th>
              <th className="py-3.5 px-3 hidden lg:table-cell">Size</th>
              <th className="py-3.5 px-3 hidden sm:table-cell">Uploaded</th>
              <th className="py-3.5 px-3">Expiry</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pr-4 sm:pr-6 pl-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {documents.map(doc => (
              <tr
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* Star toggle */}
                <td className="py-3.5 pl-4 sm:pl-6 pr-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStarDocument(doc.id)}
                    className={`p-1 rounded transition-colors ${
                      doc.isStarred
                        ? 'text-amber-400'
                        : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={doc.isStarred ? 'currentColor' : 'none'} />
                  </button>
                </td>

                {/* Name + icon */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon fileType={doc.fileType} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {doc.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate md:hidden">
                        {doc.category} &bull; {doc.sizeFormatted}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs">
                    {doc.category}
                  </span>
                </td>

                {/* Size */}
                <td className="py-3.5 px-3 hidden lg:table-cell text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {doc.sizeFormatted}
                </td>

                {/* Uploaded date */}
                <td className="py-3.5 px-3 hidden sm:table-cell text-slate-500 dark:text-slate-400 text-xs">
                  {formatDate(doc.uploadedAt)}
                </td>

                {/* Expiry */}
                <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-xs">
                  {doc.expiryDate ? formatDate(doc.expiryDate) : '—'}
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-3">
                  <StatusBadge status={doc.status} expiryDate={doc.expiryDate} size="sm" />
                </td>

                {/* Actions */}
                <td className="py-3.5 pr-4 sm:pr-6 pl-2 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handlePreview(e, doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="View / Preview in browser"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onShare(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Share link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* 3-dot toggle */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuDocId === doc.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-1">
                          <button
                            onClick={() => {
                              setActiveMenuDocId(null);
                              onRename(doc);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Rename
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuDocId(null);
                              onDelete(doc);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
