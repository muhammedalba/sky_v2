import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  desc?: string;
  children: React.ReactNode;
}

export function SectionWrapper({ title, desc, children, className, ...props }: SectionWrapperProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      <div>
        <h2 className="text-xl font-bold title-gradient">{title}</h2>
        {desc && <p className="text-muted-foreground text-sm mt-1">{desc}</p>}
      </div>
      {children}
    </section>
  );
}
