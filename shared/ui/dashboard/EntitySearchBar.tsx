"use client";

import { SearchIcon } from "@/shared/ui/Icons";
import { Input } from "@/shared/ui/Input";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface EntitySearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
}

export default function EntitySearchBar({
  placeholder = "Search...",
  defaultValue = "",
  onSearch,
  debounceMs = 500,
  className,
  disabled = false,
}: EntitySearchBarProps) {
  // Track both the input value and the last seen defaultValue in a single state.
  // When defaultValue changes from the parent/URL, we detect it during render
  // and reset searchTerm in the same pass — the React-idiomatic "derived state"
  // pattern (replaces useState + useEffect, and avoids ref access during render).
  const [{ searchTerm, prevDefault }, setSearchState] = useState({
    searchTerm: defaultValue || "",
    prevDefault: defaultValue,
  });

  // If the parent passed a new defaultValue, update searchTerm in the same render.
  // Calling setState during render is only safe when guarded by a changed-value check.
  if (prevDefault !== defaultValue) {
    setSearchState({
      searchTerm: defaultValue || "",
      prevDefault: defaultValue,
    });
  }

  const setSearchTerm = useCallback(
    (value: string) =>
      setSearchState((s) => ({ ...s, searchTerm: value })),
    [setSearchState],
  );

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Keep latest onSearch callback reference to avoid re-triggering the search effect when the parent
  // re-renders or when URL query parameters (such as pagination) create a new callback reference.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Track the initial render and the last executed search query to prevent redundant searches
  const isFirstRender = useRef(true);
  const lastSearchedRef = useRef(defaultValue);

  // Synchronize lastSearchedRef when defaultValue changes from an external source (e.g. URL query reset)
  useEffect(() => {
    lastSearchedRef.current = defaultValue;
  }, [defaultValue]);

  /**
   * Effect to trigger the search callback when the debounced term changes.
   * - Ignores initial component mount.
   * - Only triggers if debouncedSearchTerm is genuinely different from the last searched term.
   * - Does not depend on onSearch reference, preventing pagination from resetting the search.
   */
  useEffect(() => {
    // Skip firing search on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only fire when the search value has genuinely changed
    if (debouncedSearchTerm !== lastSearchedRef.current) {
      lastSearchedRef.current = debouncedSearchTerm;
      onSearchRef.current(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-accent/40 backdrop-blur-sm p-1 rounded-2xl border border-border  w-full max-w-2xl",
        className,
      )}
    >
      <div className="relative flex-1 group">
        <SearchIcon className="absolute inset-s-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          disabled={disabled}
          className="ps-11 h-8 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-sm placeholder:text-muted-foreground/60"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
