"use client";

import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";

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
  SubCategories?: SubCategoryItem[];
}

interface CategoriesScrollerProps {
  categories: CategoryItem[];
  className?: string;
}

// ─── Scroll Arrow Button ──────────────────────────────────────────────────────

const ScrollArrow = memo(function ScrollArrow({
  direction,
  onClick,
  visible,
  isRtl, // تمت إضافة هذه الخاصية لعكس الأيقونات في اللغة العربية
}: {
  direction: "start" | "end";
  onClick: () => void;
  visible: boolean;
  isRtl: boolean;
}) {
  if (!visible) return null;

  const isStart = direction === "start";
  // in RTL languages, the "start" direction corresponds to the right side and the "end" direction corresponds to the left side. Therefore, we determine which arrow to show based on the combination of the direction and the isRtl flag. The logic is as follows:
  // in RTL languages, the "start" arrow should point to the right and the "end" arrow should point to the left.
  const showLeftArrow = isRtl ? !isStart : isStart;

  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-10 cursor-pointer opacity-0 group-hover/scroller:opacity-100 transition-opacity",
        "w-8 h-8 rounded-full",
        "bg-background/80 backdrop-blur-sm border border-border/60",
        "shadow-md hover:shadow-lg",
        "flex items-center justify-center",
        "text-foreground/70 hover:text-foreground",
        "transition-all duration-200",
        "hover:scale-110 active:scale-95",
        isStart ? "inset-s-0" : "inset-e-0",
      )}
    >
      {showLeftArrow ? (
        <ChevronLeft size={16} strokeWidth={2.5} />
      ) : (
        <ChevronRight size={16} strokeWidth={2.5} />
      )}
    </button>
  );
});

// ─── Category Item with Dropdown ────────────────────────────────────────────────

const CategoryItemWithDropdown = memo(function CategoryItemWithDropdown({
  category,

}: {
  category: CategoryItem;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubs = useMemo(
    () => !!category.SubCategories?.length,
    [category.SubCategories],
  );
  const locale = useLocale();
  const [position, setPosition] = useState<{
    top: number;
    left: number | "auto";
    right: number | "auto";
  }>({ top: 0, left: 0, right: "auto" });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextPosition =
      locale === "ar"
        ? {
            top: rect.bottom + 3,
            left: "auto" as const,
            right: window.innerWidth - rect.right ,
          }
        : {
            top: rect.bottom + 3,
            left: rect.left ,
            right: "auto" as const,
          };

    setPosition((prev) => {
      if (
        prev.top === nextPosition.top &&
        prev.left === nextPosition.left &&
        prev.right === nextPosition.right
      ) {
        return prev;
      }

      return nextPosition;
    });
  }, [locale]);

  const closeDropdown = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", closeDropdown, true);
    window.addEventListener("resize", closeDropdown);
    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [open, closeDropdown]);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (hasSubs) {
      updatePosition();
      setOpen(true);
    }
  }, [hasSubs, updatePosition]);

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(closeDropdown, 100);
  }, [closeDropdown]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!hasSubs) return;
      e.preventDefault();
      setOpen((prev) => {
        if (!prev) updatePosition();
        return !prev;
      });
    },
    [hasSubs, updatePosition],
  );


  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={triggerRef}
    >
      
        <Link
          href={`/products?category=${category._id}`}
          onClick={handleClick}
          className={cn(
            "shrink-0 flex items-center hover:text-primary hover:bg-primary/10 border border-border/20 hover:border-primary/30 text-xs font-medium  gap-2 px-4 py-1 rounded-full whitespace-nowrap active:scale-95 transition-all select-none",
            open
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted/10  text-foreground/80 ",
          )}
        >
          {category.image && (
            <ImageWithFallback
              src={category.image}
              alt={`category: ${category.name}`}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <span>{category.name}</span>
          {hasSubs && (
            <ChevronRight
              size={14}
              strokeWidth={2}
              className={cn(
                "transition-transform duration-200",
                open && "rotate-90",
              )}
            />
          )}
        </Link>
     

      {open && hasSubs && (
        <div
          className={cn(
            "fixed mt-1 min-w-50 max-w-70",
            "bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl",
            "p-1.5 z-100000",
            "animate-in fade-in zoom-in-95 duration-300 inset-s-0",
          )}
          style={{
            top: position.top,
            left: position.left !== "auto" ? position.left : undefined,
            right: position.right !== "auto" ? position.right : undefined,
          }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <Link
            href={`/products?category=${category._id}`}
            onClick={closeDropdown}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/8 text-sm font-bold text-primary transition-colors mb-1 border-b border-border/20 pb-2"
          >
            {category.image && (
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                width={20}
                height={20}
                className="w-5 h-5 rounded object-cover"
                loading="lazy"
              />
            )}
            {category.name}
          </Link>

          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {category.SubCategories?.map((sub) => (
              <Link
                key={sub._id}
                href={`/products?subCategory=${sub._id}`}
                onClick={closeDropdown}
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
});

// ─── Main Component ───────────────────────────────────────────────────────────

function CategoriesScroller({
  categories,
  className,
}: CategoriesScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    // if maxScroll is 0 or negative, it means the content fits within the container and there's no need to scroll
    if (maxScroll <= 0) {
      setCanScrollStart(false);
      setCanScrollEnd(false);
      return;
    }

    // absScroll is used to handle potential negative scrollLeft values in RTL contexts, ensuring consistent behavior across different browsers and languages. The thresholds (2 pixels) are used to account for minor discrepancies in scroll values that can occur due to rounding or browser-specific implementations, providing a more reliable way to determine if the user can scroll further in either direction.
    const absScroll = Math.abs(Math.round(scrollLeft));

    setCanScrollStart(absScroll > 2);
    setCanScrollEnd(absScroll < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame: number;

    // scheduling the initial check in the next animation frame ensures that the DOM has fully rendered and all styles have been applied, providing accurate measurements of the scrollable area. This is particularly important if the content or layout is dynamic, as it allows the component to correctly determine whether scrolling is possible right after it mounts.
    frame = requestAnimationFrame(updateScrollState);

    el.addEventListener("scroll", updateScrollState, { passive: true });

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(updateScrollState);
    });

    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);

      el.removeEventListener("scroll", updateScrollState);

      observer.disconnect();
    };
  }, [updateScrollState]);

  const scroll = useCallback(
    (direction: "start" | "end") => {
      const el = scrollRef.current;
      if (!el) return;

      const amount = el.clientWidth * 0.6;

      const sign = direction === "start" ? (isRtl ? 1 : -1) : isRtl ? -1 : 1;

      el.scrollBy({
        left: amount * sign,
        behavior: "smooth",
      });
    },
    [isRtl],
  );

  if (!categories.length) return null;

  return (
    <div className={cn("relative group/scroller", className)}>
      {/* Scroll Arrows */}
      <ScrollArrow
        direction="start"
        onClick={() => scroll("start")}
        visible={canScrollStart}
        isRtl={isRtl} // added isRtl prop to handle arrow direction in RTL languages
      />
      <ScrollArrow
        direction="end"
        onClick={() => scroll("end")}
        visible={canScrollEnd}
        isRtl={isRtl} // added isRtl prop to handle arrow direction in RTL languages
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
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <CategoryItemWithDropdown
            key={cat._id}
            category={cat}
            
          />
        ))}
      </div>
    </div>
  );
}

export default memo(CategoriesScroller);
