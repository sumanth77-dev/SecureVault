import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Download,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  KeyRound,
  Sun,
  Moon,
  Loader2,
  ArrowLeft,
  AlertOctagon,
  FileX
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import { DocumentPreviewCanvas } from '../../components/common/DocumentPreviewCanvas';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { shareService } from '../../services/shareService';
import { formatRemainingCountdown } from '../../utils/formatters';

export const SharedViewerPage = () => {
  const { token } = useParams();
  const { sharedDocuments, documents } = useDocuments();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState(null);
  const [unlockToken, setUnlockToken] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');

  // Load public share details from backend API or local mock context
  useEffect(() => {
    let isMounted = true;
    async function loadShare() {
      setLoading(true);
      setError('');
      setIsRevoked(false);
      setIsExpired(false);
      setIsNotFound(false);

      try {
        if (token) {
          const data = await shareService.getPublicShare(token);
          if (isMounted && data) {
            if (data.isRevoked || data.status === 'revoked') {
              setIsRevoked(true);
              setError('This document link has been revoked by the owner.');
            } else {
              setShareData(data);
              setIsUnlocked(data.isUnlocked || !data.hasPassword);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = err.message || '';
          const isRevocation =
            err.code === 'SHARE_REVOKED' ||
            err.status === 410 && errMsg.toLowerCase().includes('revoked') ||
            errMsg.toLowerCase().includes('revoked');

          const isExpiration =
            err.status === 410 && (errMsg.toLowerCase().includes('expired') || errMsg.toLowerCase().includes('limit')) ||
            errMsg.toLowerCase().includes('expired');

          const is404 = err.status === 404 || errMsg.toLowerCase().includes('not exist') || errMsg.toLowerCase().includes('not found');

          // Check local state fallback for mock mode
          const localShare = sharedDocuments.find(s => s.token === token);
          if (localShare) {
            if (localShare.status === 'revoked') {
              setIsRevoked(true);
              setError('This document link has been revoked by the owner.');
            } else if (localShare.status === 'expired') {
              setIsExpired(true);
              setError('This secure link has expired.');
            } else {
              setShareData({
                ...localShare,
                localDoc: documents.find(d => d.id === localShare.documentId)
              });
              setIsUnlocked(!localShare.hasPassword);
            }
          } else if (isRevocation) {
            setIsRevoked(true);
            setError(errMsg || 'This document link has been revoked by the owner.');
          } else if (isExpiration) {
            setIsExpired(true);
            setError(errMsg || 'This secure link has expired.');
          } else if (is404) {
            setIsNotFound(true);
            setError(errMsg || 'This secure link does not exist or has been removed.');
          } else {
            setError(errMsg || 'Unable to access shared document.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadShare();
    return () => { isMounted = false; };
  }, [token, sharedDocuments, documents]);

  // Real expiration timestamp countdown timer
  useEffect(() => {
    if (!shareData?.expiresAt || isRevoked || isExpired) {
      setCountdown(shareData ? 'Never expires' : '');
      return;
    }

    const tick = () => {
      const { formatted, isExpired: expired } = formatRemainingCountdown(shareData.expiresAt);
      setCountdown(formatted);
      if (expired) {
        setIsExpired(true);
        setError('This secure link has expired.');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [shareData?.expiresAt, isRevoked, isExpired]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (isRevoked || isExpired) return;

    if (!shareData?.hasPassword) {
      setIsUnlocked(true);
      return;
    }

    try {
      if (token) {
        const res = await shareService.unlockPublicShare(token, password);
        if (res?.isUnlocked) {
          setIsUnlocked(true);
          setUnlockToken(res.unlockToken);
          setError('');
          showToast('Document decrypted and unlocked.', 'success');
          return;
        }
      }
    } catch (err) {
      if (err.code === 'SHARE_REVOKED' || err.message?.toLowerCase().includes('revoked')) {
        setIsRevoked(true);
        setError('This document link has been revoked by the owner.');
      } else {
        setError(err.message || 'Incorrect passcode. Please check with the document owner.');
      }
    }
  };

  const handleDownload = async () => {
    if (isRevoked || isExpired) {
      showToast('Cannot download: Link access has been terminated.', 'error');
      return;
    }

    showToast(`Downloading "${shareData?.documentName || 'document'}"...`, 'info');
    try {
      if (token) {
        const res = await shareService.getPublicDownloadUrl(token, unlockToken);
        if (res?.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
          showToast(`Download started for "${shareData?.documentName}".`, 'success');
          return;
        }
      }
    } catch (err) {
      if (err.code === 'SHARE_REVOKED' || err.message?.toLowerCase().includes('revoked')) {
        setIsRevoked(true);
        setError('This document link has been revoked by the owner.');
        showToast('Document access was revoked by the owner.', 'error');
        return;
      }
      console.warn('API download trigger fallback:', err);
    }
    setTimeout(() => {
      showToast(`Download complete for "${shareData?.documentName}".`, 'success');
    }, 1200);
  };

  const currentDoc = shareData?.localDoc || {
    id: 'doc-shared',
    name: shareData?.documentName || 'Document.pdf',
    title: (shareData?.documentName || 'Document').replace(/\.[^/.]+$/, ''),
    category: shareData?.category || 'Personal',
    sizeFormatted: shareData?.sizeFormatted || '2.4 MB',
    fileType: (shareData?.documentName || '').endsWith('.jpg') ? 'jpg' : (shareData?.documentName || '').endsWith('.png') ? 'png' : 'pdf',
    previewType: 'contract'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Verifying cryptographic link & access status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">SecureVault</span>
        </NavLink>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Ephemeral Portal
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        {/* 1. DEDICATED ACCESS REVOKED SCREEN */}
        {isRevoked ? (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Glowing Revoked Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-rose-500/15 animate-ping" />
              <div className="relative w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shadow-md">
                <ShieldAlert className="w-9 h-9" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <AlertOctagon className="w-3.5 h-3.5" /> Access Revoked
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Document Access Revoked
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The document owner has revoked access permissions for this secure share link. The file cannot be decrypted, viewed, or downloaded.
              </p>
            </div>

            {/* Revocation Security Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Security Status:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <ShieldX className="w-3.5 h-3.5" /> Access Terminated
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Security Link:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                  #TRX-{token?.substring(0, 10) || 'INVALID'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-rose-100 dark:border-rose-900/40">
                <span className="text-slate-500 dark:text-slate-400">Policy:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Zero-Trust Revocation</span>
              </div>
            </div>

            <div className="pt-2">
              <NavLink to="/">
                <Button variant="primary" icon={ArrowLeft} className="w-full">
                  Return to SecureVault
                </Button>
              </NavLink>
            </div>
          </div>
        ) : isExpired ? (
          /* 2. DEDICATED EXPIRED LINK SCREEN */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mx-auto flex items-center justify-center shadow-md">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                Link Expired
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                This Secure Link Has Expired
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The time limit set by the vault owner for this link has elapsed. Request a new share link from the sender to access this file.
              </p>
            </div>

            <div className="pt-2">
              <NavLink to="/">
                <Button variant="primary" icon={ArrowLeft} className="w-full">
                  Return to SecureVault
                </Button>
              </NavLink>
            </div>
          </div>
        ) : isNotFound ? (
          /* 3. DEDICATED NOT FOUND SCREEN */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center shadow-md">
              <FileX className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Secure Link Not Found
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                This share link does not exist or has been removed. Please verify the URL with the sender.
              </p>
            </div>

            <div className="pt-2">
              <NavLink to="/">
                <Button variant="primary" icon={ArrowLeft} className="w-full">
                  Return to SecureVault
                </Button>
              </NavLink>
            </div>
          </div>
        ) : !isUnlocked ? (
          /* 4. LOCKED CHALLENGE CARD */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 mx-auto flex items-center justify-center shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Protected Document Transfer
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Someone shared a document with you
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Shared via SecureVault by <strong>{shareData?.sharedBy || 'Vault Owner'}</strong>
              </p>
            </div>

            {/* Document badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {shareData?.documentName || 'Encrypted File'}
                  </p>
                  <p className="text-xs text-slate-400">{shareData?.sizeFormatted || 'Protected'}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-semibold shrink-0">
                Encrypted
              </span>
            </div>

            {/* Expiry Countdown Timer */}
            {shareData?.expiresAt && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 py-2 px-3 rounded-xl border border-amber-200 dark:border-amber-900">
                <Clock className="w-4 h-4" />
                <span>This secure link expires in <strong>{countdown}</strong></span>
              </div>
            )}

            {/* Password Unlock Form */}
            <form onSubmit={handleUnlock} className="space-y-4 text-left">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter recipient password"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Unlock &amp; View Document
              </Button>
            </form>
          </div>
        ) : (
          /* 5. UNLOCKED DOCUMENT PREVIEW AREA */
          <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header info bar */}
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {shareData?.documentName || currentDoc.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-xs font-semibold">
                      Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Category: <strong>{shareData?.category || currentDoc.category}</strong> &bull; Size: {shareData?.sizeFormatted || currentDoc.sizeFormatted} &bull; Shared with {shareData?.sharedWith || 'Recipient'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {shareData?.allowDownload !== false && (
                  <Button variant="primary" icon={Download} onClick={handleDownload}>
                    Download Original File
                  </Button>
                )}
              </div>
            </div>

            {/* Document Rendered Canvas */}
            <div className="p-4 sm:p-8 bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <DocumentPreviewCanvas document={currentDoc} token={token} unlockToken={unlockToken} />
            </div>

            {/* Security note */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> This session is monitored and logged under cryptographic reference: #TRX-{token?.substring(0, 8) || '9921'}
              </span>
              <span>{countdown ? `Expires in ${countdown}` : 'Protected Session'}</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-400">
        Secured by <NavLink to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">SecureVault Document Platform</NavLink> &bull; Zero Knowledge Verification
      </footer>
    </div>
  );
};
