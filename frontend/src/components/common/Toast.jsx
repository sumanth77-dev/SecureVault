import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-slate-900 dark:bg-slate-800 text-white border-emerald-500/40',
              iconColor: 'text-emerald-400'
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-rose-950 text-rose-100 border-rose-800',
              iconColor: 'text-rose-400'
            },
            warning: {
              icon: AlertTriangle,
              bg: 'bg-amber-950 text-amber-100 border-amber-800',
              iconColor: 'text-amber-400'
            },
            info: {
              icon: Info,
              bg: 'bg-slate-900 dark:bg-slate-800 text-white border-blue-500/40',
              iconColor: 'text-blue-400'
            }
          }[toast.type] || {
            icon: CheckCircle2,
            bg: 'bg-slate-900 text-white border-slate-700',
            iconColor: 'text-emerald-400'
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${typeConfig.bg}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${typeConfig.iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-snug">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white shrink-0 p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
