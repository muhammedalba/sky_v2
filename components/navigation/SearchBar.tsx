"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SearchIcon, XIcon } from "@/shared/ui/Icons";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface SearchBarProps {
  className?: string;
  useLiveSearch?: boolean;
}

export default function SearchBar({
  className,
  useLiveSearch = false,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams?.get("search") || "");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations("store.nav");
  const debouncedQuery = useDebounce(query, 400);
  const pathname = usePathname();
  const isProductsPage = pathname.startsWith("/products");
  // Sync state with URL search query changes during render to avoid cascading effects
  const currentSearch = searchParams?.get("search") || "";
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  if (currentSearch !== prevSearch) {
    setQuery(currentSearch);
    setPrevSearch(currentSearch);
  }

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (useLiveSearch) {
      const urlSearch = searchParams?.get("search") || "";

      // If debounced query matches URL, it means the sync is already complete
      if (debouncedQuery.trim() === urlSearch) {
        return;
      }

      const params = new URLSearchParams(searchParams?.toString() || "");
      if (debouncedQuery.trim()) {
        params.set("search", debouncedQuery.trim());
      } else {
        params.delete("search");
      }

      params.delete("page"); // Reset page on new search

      const newUrl = `/products${params.toString() ? `?${params.toString()}` : ""}`;
      router.push(newUrl);
    }
  }, [debouncedQuery, router, searchParams, useLiveSearch]);
  if (!isProductsPage) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
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
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              // Focus back to input if desired, but here we just clear
            }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </form>
  );
}
