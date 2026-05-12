import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id, duration: toast.duration || 5000 };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register the global toast handler when the provider mounts
  useEffect(() => {
    registerToast(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Individual Toast Component
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const variantConfig = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      title: 'text-slate-900',
      desc: 'text-slate-600',
      progressBg: 'bg-slate-300',
    },
    destructive: {
      bg: 'bg-white',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'text-red-900',
      desc: 'text-red-700',
      progressBg: 'bg-red-400',
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: 'text-emerald-900',
      desc: 'text-emerald-700',
      progressBg: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'text-amber-900',
      desc: 'text-amber-700',
      progressBg: 'bg-amber-400',
    },
  };

  const iconMap: Record<ToastVariant, React.ElementType> = {
    default: Bell,
    destructive: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
  };

  const config = variantConfig[toast.variant || 'default'];
  const IconComponent = iconMap[toast.variant || 'default'];

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-xl p-4 shadow-xl transition-all duration-300 animate-slideIn overflow-hidden`}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${config.iconBg} ${config.iconColor} rounded-lg p-2.5 flex-shrink-0 flex items-center justify-center`}>
          <IconComponent className="h-5 w-5" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`${config.title} font-bold text-sm leading-tight`}>
              {toast.title}
            </h4>
          )}
          {toast.description && (
            <p className={`${config.desc} text-xs mt-1.5 leading-relaxed`}>
              {toast.description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 ml-2 p-1`}
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className={`${config.progressBg} h-0.5 mt-3 rounded-full animate-toastProgress`}></div>
    </div>
  );
};

// Container that renders toasts
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-96 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Standalone toast function (for use outside React components)
let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const registerToast = (addToast: (toast: Omit<Toast, 'id'>) => void) => {
  globalAddToast = addToast;
};

export const toast = {
  success: (title: string, description?: string) => {
    globalAddToast?.({ title, description, variant: 'success' });
  },
  error: (title: string, description?: string) => {
    globalAddToast?.({ title, description, variant: 'destructive' });
  },
  warning: (title: string, description?: string) => {
    globalAddToast?.({ title, description, variant: 'warning' });
  },
  info: (title: string, description?: string) => {
    globalAddToast?.({ title, description, variant: 'default' });
  },
};