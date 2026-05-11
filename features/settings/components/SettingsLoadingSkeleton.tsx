export default function SettingsLoadingSkeleton() {
  return (
    <div className="pb-20">
      {/* Header skeleton */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-md px-3 pb-4 pt-6 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-muted/60 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-primary/20 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-2xl animate-pulse"
              style={{
                backgroundColor: i === 0 ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--muted) / 0.5)',
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </aside>

        {/* Content skeleton */}
        <main className="flex-1">
          <div className="border border-border/50 rounded-3xl overflow-hidden">
            <div className="bg-muted/20 border-b border-border/50 p-6 space-y-2">
              <div className="h-6 w-40 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-muted/50 rounded-lg animate-pulse" />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
                    <div className="h-11 bg-muted/40 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
