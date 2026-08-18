import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Palette,
  HardDrive,
  AlertTriangle,
  Check,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Trash2,
  Lock,
  Mail
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { useToast } from '../../components/common/Toast';

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { metrics } = useDocuments();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('appearance');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    expiryReminders: true,
    securityAlerts: true,
    shareAccessed: true,
    weeklyDigest: false
  });

  const handleSaveNotifPrefs = (e) => {
    e.preventDefault();
    showToast('Notification preferences saved.', 'success');
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(false);
    logout();
    showToast('Your vault has been permanently deleted.', 'info');
    navigate('/');
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Storage & Quota', icon: HardDrive },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, isDanger: true }
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Vault Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize themes, notification delivery rules, storage plans, and security policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? tab.isDanger
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                  : tab.isDanger
                  ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Interface Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your preferred color theme. Preferences are preserved across all browser sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'light', label: 'Light Theme', desc: 'Clean white with deep navy contrasts', icon: Sun },
              { id: 'dark', label: 'Dark Mode', desc: 'Deep slate navy with crisp accents', icon: Moon },
              { id: 'system', label: 'System Default', desc: 'Automatically match OS preference', icon: Laptop }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setTheme(item.id);
                    showToast(`Theme set to ${item.label}.`, 'info');
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Notifications Tab */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifPrefs} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control which alerts are delivered to your inbox and browser.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {[
              {
                id: 'expiryReminders',
                title: 'Document Expiry Reminders',
                desc: 'Receive alerts 45, 30, and 7 days before passport, license, or insurance expires.'
              },
              {
                id: 'securityAlerts',
                title: 'Security & Access Alerts',
                desc: 'Notify immediately when new logins or biometric verifications occur.'
              },
              {
                id: 'shareAccessed',
                title: 'Shared Document Access Notices',
                desc: 'Receive a ping whenever an external recipient unlocks or downloads a shared file.'
              },
              {
                id: 'weeklyDigest',
                title: 'Weekly Vault Digest',
                desc: 'Weekly summary of storage usage and upcoming renewals.'
              }
            ].map(pref => (
              <div key={pref.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pref.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pref.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={notifPrefs[pref.id]}
                    onChange={e => setNotifPrefs({ ...notifPrefs, [pref.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" variant="primary">
              Save Preferences
            </Button>
          </div>
        </form>
      )}

      {/* 3. Storage Tab */}
      {activeTab === 'storage' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Storage Plan &amp; Quota</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SecureVault allocates encrypted zero-knowledge storage for each user account.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  Personal Vault Plan
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {metrics.storageUsedMB} MB of {metrics.storageLimitMB} MB Used
                </h4>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold self-start sm:self-auto">
                Healthy Storage
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.storagePercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{metrics.totalDocs} indexed documents</span>
              <span>{(metrics.storageLimitMB - metrics.storageUsedMB).toFixed(1)} MB available</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Security Tab */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Safeguards</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review current authentication rules and encryption configurations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">256-bit AES Metadata Tagging</h4>
                  <p className="text-xs text-slate-500">Every document title and tag is stored in private encrypted partitions.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-blue-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automated Expiry Radar</h4>
                  <p className="text-xs text-slate-500">Scheduled background jobs evaluate document expiry deadlines continuously.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">Danger Zone</h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              These actions are permanent and will destroy your vault documents and encryption keys.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Vault Account</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Permanently purge all 24 documents, 6 folders, active share links, and audit history.
              </p>
            </div>

            <Button
              variant="danger"
              size="md"
              icon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Vault Account?"
        message="This action is irreversible. All your personal documents, certificates, insurance policies, and keys will be permanently deleted from SecureVault."
        confirmLabel="Yes, Delete Everything"
        confirmVariant="danger"
      />
    </div>
  );
};
