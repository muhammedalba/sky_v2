import { ElementType } from "react";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

interface ProductsSectionHeaderProps {
  icon: ElementType;
  title: string;
  description?: string;
}

export default function ProductsSectionHeader({
  icon: Icon,
  title,
  description,
}: ProductsSectionHeaderProps) {
  return (
    <ScrollReveal animation="slide-up">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-2xl sm:text-3xl font-black title-gradient">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xl mb-6">
          {description}
        </p>
      )}
    </ScrollReveal>
  );
}