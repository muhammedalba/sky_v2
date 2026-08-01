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

  // disable search on first render
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      onSearch(debouncedSearchTerm);
      isMounted.current = false;
    } else {
      isMounted.current = true;
    }
  }, [debouncedSearchTerm, onSearch]);

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
