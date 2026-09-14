"use client";

import { useState, useEffect, useRef } from "react";
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
 *  - Live-search: debounces 400 ms then pushes URL, scrolls to #all-products.
 *  - Form submit: pushes URL immediately + scrolls.
 *  - Route change (navigate away): clears the input.
 *  - Locale-safe: uses router.push("/products") which next-intl localizes.
 */
export default function SearchBar({
  className,
  useLiveSearch = false,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("store.nav");

  const isProductsPage = pathname.includes("/products");

  // ─── State ─────────────────────────────────────────────────────────────────
  // Initialize from URL so refreshing the page keeps the value
  const [query, setQuery] = useState(
    () => searchParams?.get("keywords") || "",
  );
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const isMounted = useRef(false);

  // ─── Sync: URL → input (e.g. browser back/forward) ─────────────────────────
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

    const urlSearch = searchParams?.get("keywords") || "";
    if (debouncedQuery.trim() === urlSearch) return;

    const params = new URLSearchParams(searchParams?.toString() || "");
    if (debouncedQuery.trim()) {
      params.set("keywords", debouncedQuery.trim());
    } else {
      params.delete("keywords");
    }
    params.delete("search"); // clean up old param alias
    params.delete("page");   // reset pagination

    router.push(`/products?${params.toString()}`);

    // Scroll to "All Products" catalog section after a short delay
    setTimeout(() => {
      document
        .getElementById("all-products")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, [debouncedQuery, isProductsPage, router, searchParams, useLiveSearch]);

  // ─── Early return: only render on /products pages ──────────────────────────
  if (!isProductsPage) return null;

  // ─── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (query.trim()) {
      params.set("keywords", query.trim());
    } else {
      params.delete("keywords");
    }
    params.delete("search");
    params.delete("page");

    router.push(`/products?${params.toString()}`);

    setTimeout(() => {
      document
        .getElementById("all-products")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

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
          onChange={(e) => setQuery(e.target.value)}
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
