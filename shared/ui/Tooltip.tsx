import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, className, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-accent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-accent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-accent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-accent",
  };

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={cn(
          "absolute px-2.5 py-1.5 text-[11px] leading-none font-semibold text-foreground/80 bg-accent rounded-lg shadow-xl whitespace-nowrap z-100 pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-200",
          positionClasses[position],
          className
        )}>
          {content}
          <div className={cn(
            "absolute border-[5px] border-transparent",
            arrowClasses[position]
          )} />
        </div>
      )}
    </div>
  );
}
