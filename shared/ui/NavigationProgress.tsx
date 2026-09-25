"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Only show the bar if navigation takes longer than this — prefetched
// (instant) navigations finish first and never flash the bar.
const SHOW_DELAY_MS = 120;
// Give up if the route never changes (cancelled / failed navigation).
const MAX_DURATION_MS = 15000;

/** Returns true for a left-click on an internal link that will change the route. */
function isRouteChangingClick(e: MouseEvent): boolean {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;

  const anchor = (e.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;

  // Same path + query (e.g. a hash link) is not a route change
  return url.pathname + url.search !== window.location.pathname + window.location.search;
}

/**
 * Thin top progress bar for client-side navigations (all route groups).
 * Must be rendered inside <Suspense> because it reads useSearchParams().
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<{ show?: number; trickle?: number; max?: number; hide?: number }>({});
  const active = useRef(false);

  const clearTimers = () => {
    const t = timers.current;
    window.clearTimeout(t.show);
    window.clearInterval(t.trickle);
    window.clearTimeout(t.max);
    window.clearTimeout(t.hide);
    timers.current = {};
  };

  const finish = () => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setProgress(100);
    // Let the bar reach 100% and fade before resetting
    timers.current.hide = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  // Start on internal link clicks (capture phase: next/link prevents default in bubble)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isRouteChangingClick(e)) return;
      clearTimers();
      active.current = true;
      setVisible(false);
      setProgress(0);

      timers.current.show = window.setTimeout(() => {
        setVisible(true);
        setProgress(20);
        // Ease towards 90% while waiting
        timers.current.trickle = window.setInterval(() => {
          setProgress((p) => (p < 90 ? p + (90 - p) * 0.1 : p));
        }, 200);
      }, SHOW_DELAY_MS);

      timers.current.max = window.setTimeout(finish, MAX_DURATION_MS);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route committed → complete the bar
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.75"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-warning/70 shadow-[0_0_8px_var(--color-warning)] transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
