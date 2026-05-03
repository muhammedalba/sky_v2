'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}: ConfirmDialogProps) {
  // 1. حل مشكلة Hydration في Next.js (SSR)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
    >
      {/* Backdrop (خلفية أنعم) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div
        className="relative bg-background border border-border/50 rounded-2xl shadow-xl shadow-black/5 max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content Wrapper */}
        <div className="p-6">
          {/* استخدام flex و gap بدلاً من الهوامش الثابتة لدعم الـ RTL */}
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Icon */}
            <div
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ring-8 ${
                isDangerous
                  ? 'bg-destructive/10 text-destructive ring-destructive/5'
                  : 'bg-primary/10 text-primary ring-primary/5'
              }`}
            >
              {/* أبقيت على حيلتك الذكية بتدوير الأيقونة، لكن مع تحسين تموضعها */}
              <Icons.Warning className={`w-6 h-6 `} />
            </div>

            {/* Text Content */}
            <div className="flex-1 pt-1 mt-3">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground leading-none tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-muted-foreground cursor-pointer bg-accent hover:bg-accent/60 transition-colors p-1.5 rounded-md -mt-2 -me-2"
                  disabled={isLoading}
                  aria-label="Close dialog"
                >
                  <Icons.X className="w-4 h-4 text-destructive" />
                </button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {message} !
              </p>
            </div>
          </div>
        </div>

        {/* Actions (Footer) - مفصولة لونياً لتبدو أكثر احترافية */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-xl font-semibold bg-background"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'destructive' : 'default'}
            onClick={handleConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto rounded-xl font-semibold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}