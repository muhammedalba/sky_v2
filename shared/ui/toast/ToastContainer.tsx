'use client';

import { useEffect, useState } from 'react';
import { Toast as ToastType, useToastStore } from '@/store/toast-store';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

const ToastItem = ({ toast }: { toast: ToastType }) => {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Wait for exit animation
  };

  const icons = {
    success: <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success"><Icons.Check className="w-5 h-5" /></div>,
    error: <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"><Icons.Error className="w-5 h-5" /></div>,
    warning: <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning"><Icons.Dashboard className="w-5 h-5" /></div>,
    info: <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-info"><Icons.Products className="w-5 h-5" /></div>,
  };

  const borders = {
    success: 'border-l-4 border-l-green-500',
    error: 'border-l-4 border-l-red-500',
    warning: 'border-l-4 border-l-amber-500',
    info: 'border-l-4 border-l-blue-500',
  };

  return (
    <div
      className={cn(
        "bg-background/95 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden pointer-events-auto flex w-full max-w-sm transition-all duration-300 transform",
        borders[toast.type],
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-2 opacity-0 scale-95"
      )}
      role="alert"
    >
      <div className="flex-1 p-4 flex items-start gap-4">
        <div className="shrink-0">{icons[toast.type]}</div>
        <div className="flex-1 space-y-1 pt-0.5">
            {toast.title && <h3 className="font-bold text-sm text-foreground">{toast.title}</h3>}
            <p className="text-sm text-muted-foreground leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={handleRemove}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <Icons.Error className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts } = useToastStore();

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}
