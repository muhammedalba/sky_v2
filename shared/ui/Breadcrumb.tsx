import Link from "next/link";
import { ChevronRight } from "lucide-react";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-semibold" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
