import { Skeleton } from "@/shared/ui/Skeleton";
import { Card } from "@/shared/ui/Card";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="p-0">
          <div className="bg-secondary/30 h-12 flex items-center px-4 gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="p-4 space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
