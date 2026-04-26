'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubCategoryItem {
  _id: string;
  name: string;
  slug?: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  subCategories?: SubCategoryItem[];
}

interface CategoriesScrollerProps {
  categories: CategoryItem[];
  className?: string;
  variant?: 'desktop' | 'mobile';
}

// ─── Scroll Arrow Button ──────────────────────────────────────────────────────

function ScrollArrow({
  direction,
  onClick,
  visible,
}: {
  direction: 'start' | 'end';
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  const isStart = direction === 'start';

  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10',
        'w-8 h-8 rounded-full',
        'bg-background/90 backdrop-blur-sm border border-border/60',
        'shadow-md hover:shadow-lg',
        'flex items-center justify-center',
        'text-foreground/70 hover:text-foreground',
        'transition-all duration-200',
        'hover:scale-110 active:scale-95',
        isStart ? 'inset-s-0' : 'inset-e-0'
      )}
    >
      {isStart ? (
        <ChevronLeft size={16} strokeWidth={2.5} />
      ) : (
        <ChevronRight size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}

// ─── Category Item with Dropdown ────────────────────────────────────────────────

function CategoryItemWithDropdown({
  category,
  variant,
}: {
  category: CategoryItem;
  variant: 'desktop' | 'mobile';
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubs = category.subCategories && category.subCategories.length > 0;
  const locale = useLocale();
  const [position, setPosition] = useState<{
    top: number;
    left: number | 'auto';
    right: number | 'auto';
  }>({ top: 0, left: 0, right: 'auto' });

  // Update fixed position based on trigger rect
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (locale === 'ar') {
        setPosition({
          top: rect.bottom + 4,
          left: 'auto',
          right: window.innerWidth - rect.right,
        });
      } else {
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          right: 'auto',
        });
      }
    }
  }, [locale]);

  // Handle scroll to close or reposition
  useEffect(() => {
    if (!open) return;
    const handleScroll = () => {
      setOpen(false); // Close on scroll for better UX
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  // Hover Handlers (Desktop & Mobile)
  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasSubs) {
      updatePosition();
      setOpen(true);
    }
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 100);
  };

  // Click Handler (Desktop & Mobile)
  const handleClick = (e: React.MouseEvent) => {
    if (hasSubs) {
      e.preventDefault();
      if (!open) updatePosition();
      setOpen(!open);
    }
  };

  const isDesktop = variant === 'desktop';

  // Desktop Trigger UI
  const DesktopTrigger = () => (
    <Link
      href={`/products?category=${category._id}`}
      onClick={handleClick}
      className={cn(
        'shrink-0 flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all',
        open
          ? 'text-primary bg-primary/8'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
      )}
    >
      {category.name}
      {hasSubs && (
        <ChevronRight
          size={12}
          strokeWidth={2}
          className={cn('transition-transform duration-200', open && 'rotate-90')}
        />
      )}
    </Link>
  );

  // Mobile Trigger UI
  const MobileTrigger = () => (
    <Link
      href={`/products?category=${category._id}`}
      onClick={handleClick}
      className={cn(
        'shrink-0 flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap active:scale-95 transition-all select-none',
        open
          ? 'bg-primary/10 border-primary/30 text-primary'
          : 'bg-muted/60 hover:bg-primary/10 border border-border/40 hover:border-primary/30 text-sm font-semibold text-foreground/80 hover:text-primary'
      )}
    >
      {category.image && (
        <img
          src={category.image}
          alt=""
          className="w-5 h-5 rounded-full object-cover"
          loading="lazy"
        />
      )}
      <span>{category.name}</span>
      {hasSubs && (
        <ChevronRight
          size={14}
          strokeWidth={2}
          className={cn('transition-transform duration-200', open && 'rotate-90')}
        />
      )}
    </Link>
  );

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={triggerRef}
    >
      {isDesktop ? <DesktopTrigger /> : <MobileTrigger />}

      {/* Flyout Submenu (Fixed Position to escape overflow: hidden) */}
      {open && hasSubs && (
        <div
          className={cn(
            'fixed mt-1 min-w-[200px] max-w-[280px]',
            'bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl',
            'p-1.5 z-100000', // high z-index to stay above everything
            'animate-in fade-in zoom-in-95 duration-150'
          )}
          style={{
            top: position.top,
            left: position.left !== 'auto' ? position.left : undefined,
            right: position.right !== 'auto' ? position.right : undefined,
          }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {/* Link to all products in this category */}
          <Link
            href={`/products?category=${category._id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/8 text-sm font-bold text-primary transition-colors mb-1 border-b border-border/20 pb-2"
          >
            {category.image && (
              <img
                src={category.image}
                alt=""
                className="w-5 h-5 rounded object-cover"
              />
            )}
            {category.name}
          </Link>

          {/* Subcategories */}
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {category.subCategories!.map((sub) => (
              <Link
                key={sub._id}
                href={`/products?subCategory=${sub._id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary shrink-0 transition-colors" />
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CategoriesScroller({
  categories,
  className,
  variant = 'mobile',
}: CategoriesScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  // Check scroll position to show/hide arrows
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);

    // In RTL, scrollLeft is negative (or 0 at start)
    if (isRtl) {
      setCanScrollEnd(absScroll > 2);
      setCanScrollStart(absScroll < maxScroll - 2);
    } else {
      setCanScrollStart(scrollLeft > 2);
      setCanScrollEnd(scrollLeft < maxScroll - 2);
    }
  }, [isRtl]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, categories]);

  const scroll = (direction: 'start' | 'end') => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.6;
    const sign = direction === 'end' ? 1 : -1;
    // In LTR: end = right (+), start = left (-)
    // In RTL: end = left (-), start = right (+)
    const scrollAmount = isRtl ? -sign * amount : sign * amount;

    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!categories.length) return null;

  return (
    <div className={cn('relative group/scroller', className)}>
      {/* Scroll Arrows */}
      <ScrollArrow
        direction="start"
        onClick={() => scroll('start')}
        visible={canScrollStart}
      />
      <ScrollArrow
        direction="end"
        onClick={() => scroll('end')}
        visible={canScrollEnd}
      />

      {/* Gradient fades */}
      {canScrollStart && (
        <div className="absolute top-0 bottom-0 inset-s-0 w-8 bg-gradient-to-e from-background/80 to-transparent z-5 pointer-events-none" />
      )}
      {canScrollEnd && (
        <div className="absolute top-0 bottom-0 inset-e-0 w-8 bg-gradient-to-s from-background/80 to-transparent z-5 pointer-events-none" />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => (
          <CategoryItemWithDropdown
            key={cat._id}
            category={cat}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
