import  { useState, useRef, useEffect } from 'react';
import { Input } from '../Input';
import Spinner from '../Spinner';
import { SearchOption } from './SearchableSelect';
import { Icons } from '../Icons';

interface SearchableMultiSelectProps {
  label: string;
  placeholder?: string;
  selectedOptions: SearchOption[]; // Objects representing selected tags
  onSelect: (option: SearchOption) => void;
  onRemove: (id: string) => void;
  options?: SearchOption[];
  isLoading?: boolean;
  onSearch: (searchTerm: string) => void;
  error?: string;
  getDisplayValue: (opt: SearchOption) => string;
  onOpen?: () => void;
}

export function SearchableMultiSelect({
  label,
  placeholder,
  selectedOptions = [],
  onSelect,
  onRemove,
  options = [],
  isLoading = false,
  onSearch,
  error,
  getDisplayValue,
  onOpen,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedIds = selectedOptions.map(opt => opt._id);

  return (
    <div className="relative space-y-2" ref={wrapperRef}>
      {/* Selected Badges */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((opt) => (
            <div
              key={opt._id}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold flex items-center gap-2"
            >
              {getDisplayValue(opt)}
              <button
                type="button"
                onClick={() => onRemove(opt._id)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                title="Remove"
              >
                <Icons.X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Input
        placeholder={placeholder}
        value={search}
        error={error}
        label={label}
        autoComplete="off"
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onSearch(e.target.value);
        }}
        onFocus={() => {
          setIsOpen(true);
          if (onOpen) onOpen();
        }}
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background  border border-border/50 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="w-4 h-4" /> Loading...
            </div>
          ) : options && options.length > 0 ? (
            <ul className="p-1">
              {options.map((opt) => {
                const isSelected = selectedIds.includes(opt._id);
                return (
                  <li
                    key={opt._id}
                    onClick={() => {
                      if (!isSelected) {
                        onSelect(opt);
                        setSearch(''); // Auto clear search on multi-select picking
                        onSearch('');  // Let the parent know
                      } else {
                        onRemove(opt._id);
                      }
                      // Keep open for multi select
                    }}
                    className={`px-4 py-3 text-sm font-bold rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                      isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/20 text-foreground'
                    }`}
                  >
                    {getDisplayValue(opt)}
                    {isSelected && <Icons.Check className="w-4 h-4" />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No options found.</div>
          )}
        </div>
      )}
    </div>
  );
}
