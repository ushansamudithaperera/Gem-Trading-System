import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconMap = {
    default: '🔔',
    destructive: '⚠️',
    success: '✅',
    warning: '⚠️',
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all ${variantClasses[toast.variant || 'default']}`}
      role="alert"
    >
      <span className="text-lg">{iconMap[toast.variant || 'default']}</span>
      <div className="flex-1">
        {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
        {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

// Container that renders toasts
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
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