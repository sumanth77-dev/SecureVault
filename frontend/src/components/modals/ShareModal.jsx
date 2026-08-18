import React, { useState } from 'react';
import {
  Share2,
  X,
  Lock,
  Clock,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../common/Button';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../common/Toast';

export const ShareModal = ({ isOpen, onClose, document }) => {
  const { createSharedLink } = useDocuments();
  const { showToast } = useToast();

  const [sharedWith, setSharedWith] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [expiryOption, setExpiryOption] = useState('24 hours');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newShare = await createSharedLink({
        documentId: document.id,
        sharedWith: sharedWith || 'External Recipient',
        recipientEmail: recipientEmail || '',
        expiryOption,
        hasPassword,
        password: hasPassword ? password : '',
        allowDownload
      });

      const token = newShare?.token || 'sv_' + Math.random().toString(36).substring(2, 10);
      const shareUrl = `${window.location.origin}/share/${token}`;
      setGeneratedLink(shareUrl);
      showToast('Secure sharing link generated.', 'success');
    } catch (err) {
      showToast('Failed to generate link: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    showToast('Secure link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedLink(null);
    setSharedWith('');
    setRecipientEmail('');
    setExpiryOption('24 hours');
    setHasPassword(false);
    setPassword('');
    setAllowDownload(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={handleReset} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Share Document Securely</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{document.name}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {generatedLink ? (
            /* Link Generated State */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    Secure link created successfully
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                    This link expires in <strong>{expiryOption}</strong> and is protected with end-to-end access logging.
                  </p>
                </div>
              </div>

              {/* URL Display */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 select-all"
                  />
                  <Button
                    variant={copied ? 'dark' : 'primary'}
                    size="sm"
                    onClick={handleCopy}
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {hasPassword && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <KeyRound className="w-4 h-4" />
                    <span>Password: <strong>{password}</strong></span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">Required to unlock</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={handleReset}>
                  Done
                </Button>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Test Public Link
                </a>
              </div>
            </div>
          ) : (
            /* Configure Form */
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Name / Purpose <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={sharedWith}
                  onChange={e => setSharedWith(e.target.value)}
                  placeholder="e.g. Visa Embassy / Recruiter / Landlord"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Link Expiration
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {['1 hour', '24 hours', '7 days', '30 days', 'Never'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setExpiryOption(option)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                        expiryOption === option
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Protection Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Password Protection</p>
                      <p className="text-[11px] text-slate-400">Require passphrase to view</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPassword}
                      onChange={e => setHasPassword(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {hasPassword && (
                  <div className="relative pt-1 animate-in fade-in duration-150">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={hasPassword}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter a secret passphrase..."
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Allow Download Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Allow File Download</p>
                    <p className="text-[11px] text-slate-400">Recipients can download the original file</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={e => setAllowDownload(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" onClick={handleReset}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Share2} isLoading={isGenerating}>
                  Generate Secure Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
