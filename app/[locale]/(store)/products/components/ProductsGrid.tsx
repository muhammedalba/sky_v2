import { Product } from "@/types";
import { Skeleton } from "@/shared/ui/Skeleton";
import SimilarProductCard from "@/components/SimilarProductCard";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

interface ProductsGridProps {
  items: Product[];
  isLoading: boolean;
  emptyTitle: string;
  emptyDesc: string;
  /** إذا كان true يُلفّ كل بطاقة بـ ScrollReveal (للأقسام الثانوية) */
  withReveal?: boolean;
}

export default function ProductsGrid({
  items,
  isLoading,
  emptyTitle,
  emptyDesc,
  withReveal = false,
}: ProductsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-bold text-foreground">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground mt-1">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {items.map((item, i) =>
        withReveal ? (
          <ScrollReveal key={item._id} animation="fade" delay={i * 100}>
            <SimilarProductCard item={item} />
          </ScrollReveal>
        ) : (
          <SimilarProductCard key={item._id} item={item} />
        ),
      )}
    </div>
  );
}