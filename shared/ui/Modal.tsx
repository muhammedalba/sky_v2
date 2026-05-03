'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { Button } from './Button';

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
    <div className="fixed  inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary-950/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={cn(
          'relative bg-background border border-border shadow-2xl rounded-4xl w-full  animate-in zoom-in-95 fade-in duration-300', 
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 mb-3 flex items-start justify-between  bg-muted/50">
          <div className='border-b pb-5'>
            {title && (
              <h3 className="text-2xl font-black tracking-tight title-gradient">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={onClose}
            className='absolute -top-4 inset-e-0 rounded-full'
          >
            <Icons.X className="w-5 h-5 " /> {/* Close icon fallback */}
          </Button>
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
