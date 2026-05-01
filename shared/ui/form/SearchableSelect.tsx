import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../Input';
import Spinner from '../Spinner';
import { LucideIcon, SearchX, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export interface SearchOption {
  _id: string;
  name: string | { en?: string; ar?: string };
  [key: string]: unknown;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  value: string; // The selected ID
  onSelect: (id: string, optionTitle: string) => void;
  options?: SearchOption[];
  isLoading?: boolean;
  onSearch: (searchTerm: string) => void;
  error?: string;
  getDisplayValue: (opt: SearchOption) => string;
  onOpen?: () => void;
  /** Pre-fill the text input with the saved label when in edit mode */
  initialDisplayValue?: string;
  className?: string;
  disabled?: boolean;
  icon?: any;
  iconColor?: string;
  createLink?: string;
}

export function SearchableSelect({
  label,
  placeholder,
  value,
  onSelect,
  options = [],
  isLoading = false,
  onSearch,
  error,
  getDisplayValue,
  onOpen,
  initialDisplayValue = '',
  className,
  icon,
  iconColor,
  disabled = false,
  createLink,
}: SearchableSelectProps) {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(initialDisplayValue);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // When the parent provides an initialDisplayValue after async load, sync it once
  useEffect(() => {
    if (initialDisplayValue && !search) {
      setSearch(initialDisplayValue);
    }
    // Only run when initialDisplayValue changes, intentionally skip `search`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDisplayValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search text if value is cleared externally
  useEffect(() => {
    if (!value) {
      setSearch('');
    }
  }, [value]);

  return (
    <div className={`relative space-y-2 mt-7 ${className}`} ref={wrapperRef}>

      <Input
        icon={icon}
        iconColor={iconColor}
        placeholder={placeholder}
        label={label}
        value={search}
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onSearch(e.target.value);
        }}
        onFocus={() => {
          setIsOpen(true);
          if (onOpen) onOpen();
        }}
        error={error}

      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border/50 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="w-4 h-4" /> Loading...
            </div>
          ) : options && options.length > 0 ? (
            <ul className="p-1">
              {options.map((opt) => (
                <li
                  key={opt._id}
                  onClick={() => {
                    const displayVal = getDisplayValue(opt);
                    onSelect(opt._id, displayVal);
                    setSearch(displayVal);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-sm font-bold rounded-lg cursor-pointer transition-colors ${value === opt._id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20 text-foreground'
                    }`}
                >
                  {getDisplayValue(opt)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="bg-secondary/50 p-3 rounded-full">
                <SearchX className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('messages.noData')}
              </p>
              {createLink && (
                <Link 
                  href={createLink} 
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors text-sm font-bold"
                >
                  <Plus className="w-4 h-4" />
                  {t('buttons.create')}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
