import { Skeleton } from "@/shared/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-350 mx-auto w-full px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <Skeleton className="h-64 w-full rounded-2xl" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
