'use client';

import React, { memo } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Breadcrumbs = () => {
  const { locale } = useParams();
  const pathname = usePathname();

  const paths = pathname
    .split('/')
    .filter((s) => s && s !== locale && s !== 'dashboard')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <div className="hidden sm:flex items-center gap-2 overflow-hidden mr-4">
      <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">
        Dashboard
      </span>
      {paths.length > 0 && (
        <>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex items-center gap-1 overflow-hidden">
            {paths.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                <span 
                  className={cn(
                    "text-sm font-medium transition-colors",
                    i === paths.length - 1 
                      ? "text-foreground font-semibold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {crumb}
                </span>
                {i < paths.length - 1 && <span className="text-muted-foreground/40">/</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(Breadcrumbs);
