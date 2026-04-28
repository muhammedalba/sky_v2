'use client';

import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Active filter count badge */
  activeCount?: number;
}

export function FilterDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  activeCount=0,
  footer,
}: FilterDrawerProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // Lock body scroll & attach ESC listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap – focus the drawer panel when it opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* ── Overlay ────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 m-0 z-90 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer Panel ───────────────────────────────── */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          // Base
          'fixed inset-y-0 z-100 flex flex-col',
          'w-[92vw] sm:w-[420px] md:w-[440px]',
          'bg-background border-border/60 shadow-2xl',
          // Transition
          'transition-transform duration-300 ease-out',
          // RTL → drawer slides from LEFT; LTR → from RIGHT
          isRTL
            ? 'left-0 border-r'
            : 'right-0 border-l',
          // Slide state
          isOpen
            ? 'translate-x-0'
            : isRTL
              ? '-translate-x-full'
              : 'translate-x-full',
        )}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-border/40 bg-background/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
              <Icons.Settings className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold tracking-tight text-foreground truncate">
                {title}
              </h2>
              {subtitle && (
                <p className={cn("text-xs  font-medium mt-0.5 truncate",activeCount > 0 ?"text-success":"text-muted-foreground")}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Close filters"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Content ─────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {children}
        </div>

        {/* ── Sticky Footer ──────────────────────────── */}
        {footer && (
          <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-md px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
