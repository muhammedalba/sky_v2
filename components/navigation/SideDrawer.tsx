'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { CategoryItem } from './CategoriesScroller';
import Image from 'next/image';
import UserAccountMenu from '@/widgets/layout/UserAccountMenu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
}

// ─── Expandable Category Item ─────────────────────────────────────────────────

function DrawerCategoryItem({
  category,
  onClose,
}: {
  category: CategoryItem;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = category.subCategories && category.subCategories.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1">
        {/* Category Link */}
        <Link
          href={`/products?category=${category._id}`}
          onClick={onClose}
          className="flex-1 flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/50 transition-colors group"
        >
          {category.image && (
            <img
              src={category.image}
              alt=""
              className="w-8 h-8 rounded-lg object-cover border border-border/30"
              loading="lazy"
            />
          )}
          <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">
            {category.name}
          </span>
        </Link>

        {/* Expand arrow (only if subcategories exist) */}
        {hasSubs && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'shrink-0 w-9 h-9 rounded-lg',
              'flex items-center justify-center',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              'transition-all duration-200'
            )}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={cn(
                'transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {/* Subcategories (collapsible) */}
      {hasSubs && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="ps-8 pe-3 pb-1 space-y-0.5">
            {category.subCategories!.map((sub) => (
              <Link
                key={sub._id}
                href={`/products?subCategory=${sub._id}`}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-accent/40 transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary shrink-0 transition-colors" />
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SideDrawer({
  isOpen,
  onClose,
  categories,
}: SideDrawerProps) {
  const locale = useLocale();
  const t = useTranslations('store.nav');
  const isRtl = locale === 'ar';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SkyGalaxy';

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-9999 transition-all duration-300',
        isOpen ? 'visible' : 'invisible pointer-events-none'
      )}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-[85%] max-w-[340px]',
          'bg-background border-border/50 shadow-2xl',
          'flex flex-col z-10001',
          'transition-transform duration-300 ease-out',
          // Direction-aware slide
          isRtl ? 'right-0 border-l' : 'left-0 border-r',
          isRtl
            ? isOpen ? 'translate-x-0' : 'translate-x-full'
            : isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 flex items-center justify-between bg-accent/10">
          <div className="flex items-center gap-3">
            <Image
              src="/images/auth-logo.png"
              alt={`${appName} Logo`}
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-black tracking-tight text-lg">{appName}</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Nav */}
          <div className="px-4 pt-4 pb-2">
            <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
              {t('menu')}
            </p>
            <div className="space-y-1">
              {[
                { label: t('home'), href: '/home' },
                { label: t('products'), href: '/products' },
                { label: t('orders'), href: '/orders' },
                { label: t('contact'), href: '/contact' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent/50 text-sm font-bold text-foreground/80 hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories with Subcategories */}
          {categories.length > 0 && (
            <div className="px-4 py-4 border-t border-border/30">
              <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                {t.has('all_categories') ? t('all_categories') : 'Categories'}
              </p>
              <div className="space-y-0.5">
                {categories.map((cat) => (
                  <DrawerCategoryItem
                    key={cat._id}
                    category={cat}
                    onClose={onClose}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
         <UserAccountMenu />
      </div>
    </div>
  );
}
