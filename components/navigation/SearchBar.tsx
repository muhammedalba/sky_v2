"use client";

import { memo, useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useRouter } from "@/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SearchIcon } from "@/shared/ui/Icons";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface SearchBarProps {
  className?: string;
  useLiveSearch?: boolean;
}

/**
 * SearchBar — only visible on /products pages.
 *
 * Behaviour:
 *  - Uses "keywords" param (matches useProductFilters convention).
 *  - Live-search: debounces 400 ms then router.replace()s the URL (no new
 *    history entry per keystroke) inside startTransition (keeps current
 *    results visible instead of flashing the Suspense skeleton), then
 *    scrolls to #all-products only if it isn't already near the top of the
 *    viewport (desktop bar is in the navbar and needs it; mobile bar lives
 *    inside the section already, so this is a no-op there).
 *  - Form submit: router.push()es immediately (own back-button entry, since
 *    it's a deliberate action), same transition + conditional scroll.
 *  - Route change (navigate away): clears the input.
 *  - Locale-safe: uses router.push/replace("/products") which next-intl
 *    localizes.
 */
function SearchBar({ className, useLiveSearch = false }: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("store.nav");

  // Latest searchParams, read by the live-search effect without being a
  // dependency of it — useSearchParams() returns a new object on every
  // navigation (including unrelated filter/sort/page changes elsewhere on
  // the page), so keeping it out of that effect's deps avoids re-running it
  // for changes that have nothing to do with this input.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const isProductsPage = pathname.includes("/products");

  // Scrolls to the catalog only if it isn't already near the top of the
  // viewport. The desktop bar lives in the navbar (far above the catalog)
  // and needs this; the mobile bar lives inside the catalog section itself,
  // so it's already in view and this is a no-op there — which is what keeps
  // it from fighting the browser's own scroll-focused-input-into-view.
  const scrollToCatalogIfNeeded = useCallback(() => {
    const el = document.getElementById("all-products");
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top <= window.innerHeight * 0.25) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ─── State ─────────────────────────────────────────────────────────────────
  // Initialize from URL so refreshing the page keeps the value
  const [query, setQuery] = useState(
    () => searchParams?.get("keywords") || "",
  );
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 600);
  const isMounted = useRef(false);
  // Only the instance the user is actually typing into may push to the URL.
  // Desktop and mobile each render their own <SearchBar useLiveSearch />
  // simultaneously (one CSS-hidden, both mounted) — without this guard,
  // the hidden instance echoes URL updates back through its own debounce
  // and both fight over the "keywords" param. Set only in onChange, read
  // and cleared only inside the effect below — never touched during render.
  const didUserTypeRef = useRef(false);

  // ─── Sync: URL → input (e.g. browser back/forward, or the other instance) ──
  const urlKeywords = searchParams?.get("keywords") || "";
  const [prevKeywords, setPrevKeywords] = useState(urlKeywords);
  if (urlKeywords !== prevKeywords) {
    setQuery(urlKeywords);
    setPrevKeywords(urlKeywords);
  }

  // ─── Clear input when navigating away from products page ───────────────────
  // Done during render (not in an effect) to avoid cascading render warnings
  const [prevIsProducts, setPrevIsProducts] = useState(isProductsPage);
  if (!isProductsPage && prevIsProducts) {
    setQuery("");
    setPrevIsProducts(false);
  } else if (isProductsPage && !prevIsProducts) {
    setPrevIsProducts(true);
  }

  // ─── Live-search: push URL + scroll to catalog ─────────────────────────────
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    // لا تُنفّذ أي شيء إذا كان المستخدم ليس في صفحة المنتجات
    if (!isProductsPage) return;
    if (!useLiveSearch) return;
    // This debounce settled from a URL-driven sync (another SearchBar
    // instance, or browser back/forward), not from typing — don't push.
    if (!didUserTypeRef.current) return;
    didUserTypeRef.current = false;

    const currentParams = searchParamsRef.current;
    const urlSearch = currentParams?.get("keywords") || "";
    if (debouncedQuery.trim() === urlSearch) return;

    const params = new URLSearchParams(currentParams?.toString() || "");
    if (debouncedQuery.trim()) {
      params.set("keywords", debouncedQuery.trim());
    } else {
      params.delete("keywords");
    }
    params.delete("search"); // clean up old param alias
    params.delete("page");   // reset pagination

    // scroll: false — router navigation scrolls to top by default on every
    // navigation; while the user is still typing (input focused), that
    // fights the browser's own "scroll focused input into view" behavior
    // and makes the page bounce up/down on every debounce.
    //
    // replace (not push) — this fires on every debounced keystroke, so
    // using push would fill browser history with one entry per pause in
    // typing; "back" should return to the pre-search page, not step
    // through every intermediate search term.
    //
    // startTransition — CatalogGrid suspends on its data query, so without
    // this every keystroke would flash the ProductsGridSkeleton fallback;
    // marking the navigation as a transition keeps the current results on
    // screen until the new ones are ready.
    startTransition(() => {
      router.replace(`/products?${params.toString()}`, { scroll: false });
    });
    setTimeout(scrollToCatalogIfNeeded, 150);
  }, [debouncedQuery, isProductsPage, router, scrollToCatalogIfNeeded, useLiveSearch]);

  // ─── Form submit ────────────────────────────────────────────────────────────
  // Declared with useCallback (and thus before the early-return below, per
  // rules of hooks) — push (not replace) is intentional here: a deliberate
  // submit deserves its own back-button entry, unlike the debounced
  // live-search replace above.
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (query.trim()) {
        params.set("keywords", query.trim());
      } else {
        params.delete("keywords");
      }
      params.delete("search");
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
      setTimeout(scrollToCatalogIfNeeded, 150);
    },
    [query, router, scrollToCatalogIfNeeded, searchParams],
  );

  // ─── Early return: only render on /products pages ──────────────────────────
  if (!isProductsPage) return null;

  return (
    <form onSubmit={handleSubmit} className={cn("flex-1 relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2",
          "h-10 sm:h-11 rounded-xl",
          "bg-muted/40 border",
          "px-3 sm:px-4",
          "transition-all duration-300",
          isFocused
            ? "border-primary/50 bg-background shadow-md shadow-primary/5 ring-2 ring-primary/10"
            : "border-border/40 hover:border-border/60",
        )}
      >
        <SearchIcon className="size-5 text-muted-foreground shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            didUserTypeRef.current = true;
            setQuery(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.has("search") ? t("search") : "Search products..."}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
          autoComplete="off"
        />
      </div>
    </form>
  );
}

export default memo(SearchBar);
