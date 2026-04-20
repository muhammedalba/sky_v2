'use client';

import React, { memo } from 'react';
import { Icons } from '@/shared/ui/Icons';

const SearchBar = () => {
  return (
    <div className="hidden md:flex flex-1 max-w-sm">
      <div className="relative w-full">
        <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full h-9 rounded-lg bg-muted/50 pl-9 pr-4 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all border-none outline-none placeholder:text-muted-foreground/70"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">⌘K</span>
        </div>
      </div>
    </div>
  );
};

export default memo(SearchBar);
