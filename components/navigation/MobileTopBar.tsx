'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import CategoriesScroller, { type CategoryItem } from './CategoriesScroller';
import SideDrawer from './SideDrawer';
import TopbarActions from '@/widgets/layout/topbar/TopbarActions';
import { Icons } from '@/shared/ui/Icons';
import SearchBar from './SearchBar';
import Link from 'next/link';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTopBarProps {
  categories: CategoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'SkyGalaxy';

// ─── Main Component ───────────────────────────────────────────────────────────

function MobileTopBar({ categories }: MobileTopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // ستقوم React بتجاهل التحديث (Bailout) تلقائياً إذا لم تتغير القيمة الفعلية
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // مصفوفة فارغة لضمان تشغيل المستمع (Listener) مرة واحدة فقط

  // استخدام useCallback لمنع إعادة إنشاء الدوال في كل دورة تصيير
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <header
        id="mobile-top-bar"
        className={cn(
          'fixed top-0 z-40 inset-x-0 md:hidden transition-all duration-500 ease-in-out',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-lg'
            : 'bg-transparent'
        )}
      >
        {/* Row 1: Hamburger + Search + Actions */}
        <div className="flex items-center gap-2 px-4 py-2.5 justify-between">
          {/* Menu Button */}
          <button
            onClick={openDrawer}
            className={cn(
              'shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300',
              'bg-muted/50 hover:bg-accent text-foreground/70 active:scale-90 shadow-sm border border-border/20'
            )}
            aria-label="Open menu"
          >
            <Icons.Menu className='size-5' />
          </button>

          <SearchBar useLiveSearch={true} className="w-1/4 sm:w-full" />
          <div className="flex items-center gap-2">

            {/* Language Switcher */}
            <TopbarActions />
            {/* Logo */}
            <Link
              href="/home"
              className="flex items-center gap-2 group active:scale-95 transition-transform"
            >
              <ImageWithFallback
                src="/assets/images/auth-logo.png"
                alt={`${APP_NAME} Logo`}
                width={36}
                height={36}
                className="object-contain"
              />
            </Link>
          </div>

        </div>

        {/* Row 2: Categories Scroller */}
        {categories.length > 0 && (
          <div className={cn(
            "transition-all duration-300",
            scrolled ? "border-t border-border/20 bg-muted/20" : ""
          )}>
            <CategoriesScroller categories={categories} className="py-2" />
          </div>
        )}
      </header>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
      />
    </>
  );
}

export default memo(MobileTopBar);