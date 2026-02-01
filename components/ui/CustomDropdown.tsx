'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@/navigation';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
}

export function Dropdown({ trigger, children, align = 'right', className, width = 'w-56' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute top-full mt-2 bg-popover border border-border rounded-xl shadow-lg shadow-black/5 p-1 z-50 animate-in fade-in zoom-in-95 duration-200", 
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, className, href }: { children: React.ReactNode, onClick?: () => void, className?: string, href?: string }) {
  const content = (
    <div 
      onClick={onClick}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      {children}
    </div>
  );

  if (href) {
    return <Link href={href} className="w-full">{content}</Link>;
  }

  return content;
}

export function DropdownSeparator() {
  return <div className="-mx-1 my-1 h-px bg-muted" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
    return <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{children}</div>;
}
