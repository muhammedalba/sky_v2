"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useCurrencyStore, type CurrencyOverride } from "@/store/currency-store";
import { CheckIcon, ArrowLeftIcon, ArrowRightIcon } from "@/shared/ui/Icons";
import { cn } from "@/lib/utils";
import { useUsdNoticeStore } from "@/store/usd-notice-store";

const COLLAPSED_WIDTH = 20;
const COLLAPSED_HEIGHT = 44;
const EXPANDED_WIDTH = 224;
const EXPANDED_HEIGHT = 150;
const EDGE_MARGIN_Y = 8;
const DRAG_THRESHOLD = 4;

type Side = "left" | "right";
type Pos = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(max, min));
}

/**
 * Draggable currency toggle used across the storefront, letting the shopper
 * override the automatic language-based currency display.
 * Starts docked flush against the left edge, vertically centered. Vertical
 * position follows the cursor freely while dragging, but horizontally it is
 * binary: the moment a drag crosses a small threshold to the right it locks
 * flush to the right edge, and the moment it crosses back to the left it
 * locks flush to the left edge — it never rests anywhere in between. A click
 * (no drag) expands it in place to reveal the currency options, instead of
 * opening a side dropdown.
 *
 * This component is only ever mounted client-side (see CurrencyToggleLoader,
 * loaded via next/dynamic with ssr:false after the browser goes idle), so it
 * never adds to server-rendered HTML or blocks the page's initial paint.
 */
export default function CurrencyToggleButton() {
  const t = useTranslations("common.currencyToggle");
  const settings = useSettings();
  const override = useCurrencyStore((state) => state.override);
  const setOverride = useCurrencyStore((state) => state.setOverride);

  const [side, setSide] = useState<Side>("left");
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const openUsdNotice = useUsdNoticeStore((state) => state.open);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startY: 0, startTop: 0, moved: false, currentSide: "left" as Side });
  // Mirrors `pos` but is written to synchronously during drag, so mousemove
  // can move the element via direct DOM writes instead of a state update (and
  // a full re-render) on every pixel.
  const posRef = useRef<Pos>(pos);

  const options = useMemo<{ value: CurrencyOverride; label: string }[]>(
    () => [
      { value: null, label: t("automatic") },
      { value: "base", label: `${t("base")} (${settings.currencyCode})` },
      { value: "usd", label: t("usd") },
    ],
    [t, settings.currencyCode],
  );

  // Capture the initial on-screen position (from the CSS-anchored first paint:
  // flush left, vertically centered) synchronously before paint, so switching
  // to free-form top/left positioning never flashes at the wrong spot.
  useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const initial = { x: rect.left, y: rect.top };
      posRef.current = initial;
      setPos(initial);
      setReady(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { startX, startY, startTop, moved, currentSide } = dragStateRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const justStartedDragging = !moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD);
    if (!moved && !justStartedDragging) return;

    // Vertical follows the cursor 1:1. Horizontal is binary: any rightward
    // drag past the threshold locks it flush right, any leftward drag past
    // the threshold locks it flush left — it's never left anywhere in between,
    // even for the very first pixel that crosses the threshold.
    const maxTop = window.innerHeight - COLLAPSED_HEIGHT - EDGE_MARGIN_Y;
    const y = clamp(startTop + dy, EDGE_MARGIN_Y, maxTop);
    let newSide = currentSide;
    if (dx > DRAG_THRESHOLD) newSide = "right";
    else if (dx < -DRAG_THRESHOLD) newSide = "left";
    const x = newSide === "left" ? 0 : window.innerWidth - COLLAPSED_WIDTH;

    dragStateRef.current.currentSide = newSide;
    posRef.current = { x, y };

    if (justStartedDragging) {
      // First frame of an actual drag: since the very first pixel past the
      // threshold can already flip it clear across the screen, commit
      // isDragging/side/pos together in one React update so the reconciled
      // DOM lands exactly where we're about to draw it — otherwise the
      // isDragging update alone would re-render against the old (pre-drag)
      // `pos` and briefly snap the button back before the next frame.
      dragStateRef.current.moved = true;
      setIsDragging(true);
      setSide(newSide);
      setPos(posRef.current);
      return;
    }

    // Every subsequent frame bypasses React state entirely (direct DOM
    // write) so continuous vertical tracking doesn't re-render per pixel.
    if (containerRef.current) {
      containerRef.current.style.left = `${x}px`;
      containerRef.current.style.top = `${y}px`;
    }
  }, []);

  // Expand/collapse while staying flush against the currently docked edge
  // (grows into the viewport, away from the edge it's stuck to).
  const expandFlush = useCallback(() => {
    setIsExpanded(true);
    setPos((prev) => {
      const next = {
        x: side === "left" ? 0 : window.innerWidth - EXPANDED_WIDTH,
        y: clamp(prev.y, EDGE_MARGIN_Y, window.innerHeight - EXPANDED_HEIGHT - EDGE_MARGIN_Y),
      };
      posRef.current = next;
      return next;
    });
  }, [side]);

  const collapseFlush = useCallback(() => {
    setIsExpanded(false);
    setPos((prev) => {
      const next = {
        x: side === "left" ? 0 : window.innerWidth - COLLAPSED_WIDTH,
        y: clamp(prev.y, EDGE_MARGIN_Y, window.innerHeight - COLLAPSED_HEIGHT - EDGE_MARGIN_Y),
      };
      posRef.current = next;
      return next;
    });
  }, [side]);

  const handleMouseUp = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    setIsDragging(false);

    if (!dragStateRef.current.moved) {
      expandFlush();
      return;
    }

    // Side and x were already locked (and mirrored into posRef) live as the
    // drag crossed the threshold — just commit the final position to state.
    setPos(posRef.current);
  }, [handleMouseMove, expandFlush]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTop: posRef.current.y,
      moved: false,
      currentSide: side,
    };
    // Never calls preventDefault, so the browser can treat it as non-blocking.
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  // Close on outside click, same as the standard toggle.
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        collapseFlush();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, collapseFlush]);

  // Re-flush against the edge and re-clamp vertically on viewport resize,
  // throttled to once per animation frame since resize fires rapidly.
  useEffect(() => {
    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const width = isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
        const height = isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
        setPos((prev) => {
          const next = {
            x: side === "left" ? 0 : window.innerWidth - width,
            y: clamp(prev.y, EDGE_MARGIN_Y, window.innerHeight - height - EDGE_MARGIN_Y),
          };
          posRef.current = next;
          return next;
        });
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isExpanded, side]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const ArrowIcon = side === "left" ? ArrowRightIcon : ArrowLeftIcon;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 select-none",
        !ready && "top-1/2 -translate-y-1/2 left-0",
        // Only `left` transitions (the binary edge snap); `top` stays
        // instantaneous so vertical dragging tracks the cursor exactly.
        ready && "transition-[left] duration-150 ease-out",
      )}
      style={{ left: pos.x, top: ready ? pos.y : undefined, minHeight: COLLAPSED_HEIGHT }}
    >
      <div
        className={cn(
          "overflow-hidden border border-border/60 bg-background shadow-lg transition-[width] duration-300 ease-out",
          isExpanded ? "w-56" : "w-5",
          side === "left" ? "rounded-l-none rounded-r-xl" : "rounded-r-none rounded-l-xl",
        )}
      >
        {!isExpanded ? (
          <button
            type="button"
            onMouseDown={handleMouseDown}
            aria-label={t("label")}
            aria-expanded={isExpanded}
            className={cn(
              "flex h-11 w-5 items-center justify-center text-primary cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
          >
            <ArrowIcon className="w-5 h-5" />
          </button>
        ) : (
          <div className="py-1">
            {options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  if (option.value === "usd" && override !== "usd") {
                    openUsdNotice();
                  }
                  setOverride(option.value);
                  collapseFlush();
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-start hover:bg-muted/60 transition-colors",
                  override === option.value && "text-primary font-medium",
                )}
              >
                {option.label}
                {override === option.value && <CheckIcon className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
