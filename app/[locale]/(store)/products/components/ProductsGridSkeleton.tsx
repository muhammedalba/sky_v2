/**
 * Skeleton shown while the products catalog is loading.
 * Used as the Suspense fallback in ProductsCatalogSection.
 */
export default function ProductsGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Results count placeholder */}
      <div className="h-4 w-36 bg-muted rounded-full" />

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-muted"
            style={{ height: "280px" }}
          />
        ))}
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-9 h-9 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
