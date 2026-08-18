import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  Clock,
  Share2,
  FolderLock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye,
  KeyRound,
  Shield,
  Layers,
  ChevronRight,
  HardDrive,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SecureVault
            </span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#why" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Why SecureVault
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              How It Works
            </a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Security
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <NavLink to="/dashboard">
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Go to Dashboard
                </Button>
              </NavLink>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 border-b border-slate-200 dark:border-slate-800 bg-radial-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Next-Generation Personal Vault</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Your important documents.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                  Securely organized.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SecureVault helps you safely store, track expiry deadlines, organize certificates and licenses, and share records with controlled, ephemeral access.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <NavLink to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </NavLink>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero tracking ads
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated expiry radar
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ephemeral sharing links
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Interactive Secure Document Simulation */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Background decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-20 dark:opacity-30"></div>

                {/* Main Card UI Showcase */}
                <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5">
                  {/* Top Bar inside showcase */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="ml-2 text-xs font-mono text-slate-400">securevault.app/vault/sumanth</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> 256-bit AES
                    </span>
                  </div>

                  {/* Sample Expiring Document Alert Card */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                          Health Insurance Policy
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Renewal due in 7 days &bull; Aug 24, 2026
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      Action Required
                    </span>
                  </div>

                  {/* Document Stack representation */}
                  <div className="space-y-2.5">
                    {[
                      { name: 'Passport_International.pdf', category: 'Identity', size: '2.4 MB', status: 'Valid (2034)', color: 'blue' },
                      { name: 'BTech_Degree_Certificate.pdf', category: 'Education', size: '5.0 MB', status: 'Verified Seal', color: 'emerald' },
                      { name: 'Driving_Licence_Digital.pdf', category: 'Identity', size: '1.2 MB', status: 'Expiring in 23d', color: 'amber' }
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {doc.category} &bull; {doc.size}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                          doc.color === 'amber' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                          'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Share Link Preview Mini Banner */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Share2 className="w-4 h-4 text-blue-500" />
                      <span>Ephemeral link: <strong>sv.app/s/8921a</strong> (24h left)</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why SecureVault Section */}
      <section id="why" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
              Why SecureVault?
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built specifically for your high-value personal files
            </p>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Unlike generic cloud drives full of random clutter, SecureVault is designed for certificates, passports, policies, and contracts with lifecycle intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: HardDrive,
                title: 'Secure Document Storage',
                desc: 'Consolidate all IDs, certificates, tax returns, and policies in one pristine, structured vault.'
              },
              {
                icon: Clock,
                title: 'Expiry Radar Reminders',
                desc: 'Automated warnings 45, 30, and 7 days prior to expiry so you never miss a renewal deadline.'
              },
              {
                icon: FolderLock,
                title: 'Easy Organization',
                desc: 'Pre-configured folders with category tags, metadata versions, and audit trails.'
              },
              {
                icon: Share2,
                title: 'Controlled Sharing',
                desc: 'Send password-protected ephemeral links to recruiters, embassies, and landlords with expiration limits.'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 hover:shadow-lg transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
              How It Works
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Effortless 4-step document lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Upload', desc: 'Drag & drop any PDF, certificate scan, or identification card.' },
              { step: '02', title: 'Organize', desc: 'Auto-categorize into Identity, Education, Finance, Insurance, or Work.' },
              { step: '03', title: 'Secure', desc: 'Set expiration dates and enable multi-factor biometric authentication.' },
              { step: '04', title: 'Share', desc: 'Generate single-use or time-locked links with download restrictions.' }
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <span className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-400/30 font-mono">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Security Architecture Section */}
      <section id="security" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Shield className="w-4 h-4 text-emerald-500" /> Defense-in-Depth
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Engineered with strict privacy and security principles
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your credentials and personal information remain yours. Our security framework gives you total visibility over who opened your files and when.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: 'Private Storage', desc: 'Isolated personal workspaces for every user profile.' },
                  { title: 'Secure Sharing', desc: 'Password-required links with expiration countdowns.' },
                  { title: 'Access Control', desc: 'Full revocation capability at any time with one click.' },
                  { title: 'Activity Tracking', desc: 'Real-time audit log for every upload, download, and view.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 sm:p-8 border border-slate-800 text-white space-y-6 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400">Security Audit Trail // Live Feed</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Encrypted
                </span>
              </div>
              <div className="space-y-3 text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>[2026-08-17 18:30] Session TLS 1.3 Verified</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>[2026-08-17 18:25] SHA-256 Checksum: doc-001 (Passport)</span>
                  <span className="text-blue-400 font-bold">VALIDATED</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>[2026-08-17 17:40] Share Token sv_88921a authenticated</span>
                  <span className="text-amber-400 font-bold">ACCESS GRANTED</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span>[2026-08-17 16:10] Expiry Radar Scan: 24 documents checked</span>
                  <span className="text-emerald-400 font-bold">3 EXPIRING</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-blue-900 via-slate-900 to-indigo-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Keep your important documents under control.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users organizing their personal records safely with SecureVault.
          </p>
          <div className="pt-2">
            <NavLink to="/register">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="shadow-xl shadow-blue-500/30">
                Create Your Free Vault Today
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">SecureVault</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#why" className="hover:text-slate-900 dark:hover:text-white">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white">Workflow</a>
            <a href="#security" className="hover:text-slate-900 dark:hover:text-white">Security</a>
            <NavLink to="/login" className="hover:text-slate-900 dark:hover:text-white">Login</NavLink>
            <NavLink to="/register" className="hover:text-slate-900 dark:hover:text-white">Register</NavLink>
          </div>

          <div>
            &copy; {new Date().getFullYear()} SecureVault Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
