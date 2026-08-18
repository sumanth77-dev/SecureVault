import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  KeyRound,
  Eye,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AuthLayout = ({ children, title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Pane: Security Brand Graphic (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Background glow & grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">SecureVault</span>
          </NavLink>
        </div>

        {/* Central Graphic Showcase */}
        <div className="relative z-10 my-auto py-8 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Military-Grade Privacy Architecture
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Your most important documents. Organized &amp; Protected.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Never misplace a passport, degree certificate, or vehicle insurance again. SecureVault safeguards your personal records with automated expiry tracking and private sharing controls.
          </p>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <FileCheck className="w-4 h-4" /> Smart Expiry Alerts
              </div>
              <p className="text-[11px] text-slate-400">Timely reminders before insurance &amp; licenses expire.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <KeyRound className="w-4 h-4" /> Ephemeral Share Links
              </div>
              <p className="text-[11px] text-slate-400">Password protected links with automatic expiration.</p>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-6">
          <span>&copy; {new Date().getFullYear()} SecureVault Platform</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Systems Operational
          </span>
        </div>
      </div>

      {/* Right Pane: Auth Forms */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative overflow-y-auto">
        {/* Top bar with theme toggle */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <NavLink to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">SecureVault</span>
          </NavLink>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Center Auth Form */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Bottom copyright / policy */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 pt-6">
          <span>Protected by reCAPTCHA and Subject to Privacy Policy &bull; Terms of Service</span>
        </div>
      </div>
    </div>
  );
};
