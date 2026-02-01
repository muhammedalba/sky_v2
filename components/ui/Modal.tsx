'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={cn(
          'relative bg-background border border-border shadow-2xl rounded-[2rem] w-full overflow-hidden animate-in zoom-in-95 fade-in duration-300', 
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-2xl font-black tracking-tight text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          >
            <Icons.Menu className="w-5 h-5 rotate-45 scale-125" /> {/* Close icon fallback */}
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 bg-secondary/20 border-t border-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
