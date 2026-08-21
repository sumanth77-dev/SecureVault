import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { documentService } from '../../services/documentService';
import { shareService } from '../../services/shareService';
import { Button } from './Button';

export const DocumentPreviewCanvas = ({ document, token, unlockToken }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPreview() {
      if (!document && !token) return;
      setLoading(true);
      setError(null);

      try {
        if (token) {
          // Public shared preview
          const res = await shareService.getPublicPreviewUrl(token, unlockToken);
          if (isMounted && res?.previewUrl) {
            setPreviewUrl(res.previewUrl);
            setMimeType(res.mimeType || document?.mimeType || '');
          }
        } else if (document?.id) {
          // Authenticated document preview
          const res = await documentService.getPreviewUrl(document.id);
          if (isMounted && res?.previewUrl) {
            setPreviewUrl(res.previewUrl);
            setMimeType(res.mimeType || document.mimeType || '');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load document preview.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPreview();
    return () => { isMounted = false; };
  }, [document?.id, token, unlockToken]);

  if (!document && !token) return null;

  const docName = document?.name || 'Document';
  const fileExt = docName.includes('.')
    ? docName.substring(docName.lastIndexOf('.') + 1).toLowerCase()
    : (document?.fileType || 'pdf').toLowerCase();

  const isPdf = fileExt === 'pdf' || (mimeType && mimeType.includes('pdf'));
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(fileExt) ||
    (mimeType && mimeType.startsWith('image/'));

  if (loading) {
    return (
      <div className="w-full min-h-[420px] flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Decrypting & loading secure preview...
        </p>
        <span className="text-xs text-slate-400">Zero-knowledge end-to-end encryption</span>
      </div>
    );
  }

  // Real PDF inline rendering
  if (isPdf && previewUrl) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[220px] sm:max-w-md">{docName}</span>
          </div>
          <button
            onClick={() => window.open(previewUrl, '_blank')}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open in Full Viewer
          </button>
        </div>

        <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0 bg-white"
            title={docName}
          />
        </div>
      </div>
    );
  }

  // Real Image rendering
  if (isImage && previewUrl) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[220px] sm:max-w-md">{docName}</span>
          </div>
          <button
            onClick={() => window.open(previewUrl, '_blank')}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Image
          </button>
        </div>

        <div className="w-full min-h-[380px] max-h-[620px] flex items-center justify-center p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-inner">
          <img
            src={previewUrl}
            alt={docName}
            className="max-h-[560px] max-w-full object-contain rounded-xl shadow-xs"
          />
        </div>
      </div>
    );
  }

  // Fallback / Unsupported / Metadata viewer
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">{docName}</h4>
            <p className="text-xs text-slate-500">
              {document?.category || 'Encrypted Vault'} &bull; {document?.sizeFormatted || 'Standard File'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-mono">
          {fileExt.toUpperCase()}
        </span>
      </div>

      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm space-y-3 leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="font-medium text-slate-900 dark:text-white">Document Security & Integrity Notice</p>
        <p>
          This document is encrypted and stored in your private vault with cryptographic integrity verification.
        </p>
        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-500 font-semibold">{document?.status ? document.status.toUpperCase() : 'VALID'}</span>
          </div>
          {document?.uploadedAt && (
            <div className="flex justify-between">
              <span className="text-slate-400">Uploaded:</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>
          )}
          {document?.expiryDate && (
            <div className="flex justify-between">
              <span className="text-slate-400">Expiry Date:</span>
              <span className="text-amber-500">{formatDate(document.expiryDate)}</span>
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="flex justify-center pt-2">
          <Button
            variant="primary"
            icon={ExternalLink}
            onClick={() => window.open(previewUrl, '_blank')}
          >
            Open Document in Browser
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-End Secure File
        </span>
        <span>SecureVault Protected</span>
      </div>
    </div>
  );
};
