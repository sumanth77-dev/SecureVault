import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { authService } from '../../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch {
      // Ignore failure to prevent enumeration
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast('Vault recovery instructions sent to your email.', 'info');
    }
  };

  return (
    <AuthLayout
      title="Reset Vault Access"
      subtitle="Enter your verified email to receive zero-knowledge recovery instructions."
    >
      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recovery Email Dispatched
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If an account is registered with <strong>{email}</strong>, you will receive a secure token to reset your password within a few moments.
          </p>
          <div className="pt-2">
            <NavLink to="/login">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Back to Login
              </Button>
            </NavLink>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full"
            >
              Send Reset Link
            </Button>
          </div>

          <div className="text-center pt-2">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </NavLink>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
