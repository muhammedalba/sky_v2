"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Skeleton } from "@/shared/ui/Skeleton";
import { PackageIcon } from "@/shared/ui/Icons";

export function ProductLoadingSkeleton() {
  return (
    <div className="bg-muted/30 min-h-screen pt-24">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 py-2">
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-4 w-24" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gallery Skeleton */}
          <div className="md:col-span-6 md:order-2 flex flex-col md:flex-row gap-3">
            <Skeleton className="w-full aspect-9/5 rounded-sm" />
            <div className="flex md:flex-col gap-2 md:w-24 shrink-0">
              <Skeleton className="w-20 md:w-full aspect-square rounded-xl" />
              <Skeleton className="w-20 md:w-full aspect-square rounded-xl" />
              <Skeleton className="w-20 md:w-full aspect-square rounded-xl" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="md:col-span-6 md:order-1 ps-3 space-y-5">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <Skeleton className="h-8 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded" />

            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/40">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="space-y-3 pt-4">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductNotFound() {
  const t = useTranslations("product");

  return (
    <div className="bg-muted/30 min-h-screen pt-24 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-background border border-border/50 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <PackageIcon className="w-8 h-8 opacity-60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {t("notFound.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("notFound.description")}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-10 px-6 font-semibold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t("notFound.backToProducts")}
          </Link>
        </div>
      </div>
    </div>
  );
}
