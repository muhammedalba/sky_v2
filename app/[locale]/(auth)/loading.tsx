import { Skeleton } from "@/shared/ui/Skeleton";

// Mirrors AuthPageLayout (branding panel + form card) so the fallback
// matches the page that is about to appear instead of a dashboard table.
export default function Loading() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-linear-to-br from-background via-background to-secondary/5">
      {/* Branding panel (desktop only, like AuthBrandingSection) */}
      <section className="hidden lg:flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10 p-16">
        <div className="w-full max-w-md space-y-6">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <div className="grid grid-cols-2 gap-4 pt-6">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Form card */}
      <section className="flex items-center justify-center p-6 sm:p-8 lg:p-16 xl:p-20">
        <div className="w-full pt-28 lg:pt-2 max-w-md">
          <div className="bg-card/50 rounded-3xl p-8 sm:p-10 border border-border/50 shadow-2xl space-y-6">
            <div className="space-y-2 text-center">
              <Skeleton className="h-8 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}
