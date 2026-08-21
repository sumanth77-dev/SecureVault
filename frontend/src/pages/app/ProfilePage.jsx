import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  QrCode,
  Laptop,
  Smartphone,
  CheckCircle2,
  Lock,
  Camera,
  AlertCircle,
  Save
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { userService } from '../../services/userService';

export const ProfilePage = () => {
  const { user, updateProfile, toggleTwoFactor, sessions, revokeSession } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPassLoading, setIsPassLoading] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      showToast('Personal information updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassError('Please fill in required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsPassLoading(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setPassError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Master vault password updated securely.', 'success');
    } catch (err) {
      // Fallback
      setPassError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsPassLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    showToast('Profile photo updated.', 'success');
  };

  const handleRevokeSession = () => {
    if (sessionToRevoke) {
      revokeSession(sessionToRevoke.id);
      showToast(`Terminated session on ${sessionToRevoke.device}.`, 'info');
      setSessionToRevoke(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal credentials, contact info, and biometric two-factor authentication.
        </p>
      </div>

      {/* 2. Profile Avatar Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <button
            onClick={handlePhotoUpload}
            className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors cursor-pointer"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold inline-flex items-center gap-1 w-fit mx-auto sm:mx-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Biometrically Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <p className="text-[11px] text-slate-400">Vault Member since {user?.joinedDate || user?.createdAt?.split('T')[0] || '2025'}</p>
        </div>

        <div className="sm:ml-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-center sm:text-right">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Security Health</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {user?.securityScore || 94}%
          </span>
        </div>
      </div>

      {/* 3. Personal Information Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Personal Information
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={isSaving} icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* 4. Security & Two-Factor Authentication */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" /> Vault Security &amp; 2FA
        </h3>

        {/* 2FA Toggle Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Require TOTP Authenticator code whenever logging into your vault from untrusted devices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-semibold ${user?.twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user?.twoFactorEnabled}
                onChange={e => {
                  toggleTwoFactor(e.target.checked);
                  showToast(`Two-Factor Authentication ${e.target.checked ? 'Enabled' : 'Disabled'}.`, 'info');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Change Master Password form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-slate-400" /> Change Master Password
          </h4>

          {passError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="secondary" size="sm" isLoading={isPassLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* 5. Active Sessions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-4 h-4 text-blue-500" /> Active Hardware Sessions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.map(sess => (
            <div
              key={sess.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                  {sess.device.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{sess.device}</p>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {sess.browser} &bull; IP: {sess.ip} &bull; {sess.location}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => setSessionToRevoke(sess)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline shrink-0 text-left cursor-pointer"
                >
                  Revoke Session
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revoke Session Dialog */}
      {sessionToRevoke && (
        <ConfirmDialog
          isOpen={Boolean(sessionToRevoke)}
          onClose={() => setSessionToRevoke(null)}
          onConfirm={handleRevokeSession}
          title="Revoke Active Session"
          message={`Are you sure you want to sign out and invalidate access on "${sessionToRevoke.device}"?`}
          confirmLabel="Revoke Session"
          confirmVariant="danger"
        />
      )}
    </div>
  );
};
