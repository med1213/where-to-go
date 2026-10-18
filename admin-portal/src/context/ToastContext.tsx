import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: Toast = { id, message, type, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string, title = 'ສໍາເລັດ (Success)') => showToast(msg, 'success', title),
    [showToast]
  );

  const error = useCallback(
    (msg: string, title = 'ເກີດຂໍ້ຜິດພາດ (Error)') => showToast(msg, 'error', title),
    [showToast]
  );

  const info = useCallback(
    (msg: string, title = 'ແຈ້ງເຕືອນ (Info)') => showToast(msg, 'info', title),
    [showToast]
  );

  const warning = useCallback(
    (msg: string, title = 'ຄຳເຕືອນ (Warning)') => showToast(msg, 'warning', title),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white border-stone-200 text-stone-900 shadow-xl';
          let icon = <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-950/90 text-white border-emerald-500/30 shadow-2xl backdrop-blur-md';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-950/90 text-white border-rose-500/30 shadow-2xl backdrop-blur-md';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/90 text-white border-amber-500/30 shadow-2xl backdrop-blur-md';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
          } else {
            bg = 'bg-stone-900/90 text-white border-stone-700 shadow-2xl backdrop-blur-md';
            icon = <Info className="w-5 h-5 text-teal-400 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border flex items-start gap-3 transition-all transform animate-in slide-in-from-top-3 fade-in duration-200 ${bg}`}
            >
              {icon}
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="font-bold text-xs leading-none mb-1 font-lao">{toast.title}</h4>
                )}
                <p className="text-xs leading-relaxed opacity-90 font-lao break-words">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-lg text-inherit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
