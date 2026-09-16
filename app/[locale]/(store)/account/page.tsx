"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AccountHeader } from "./_components/AccountHeader";
import { AccountSidebar } from "./_components/AccountSidebar";
import { OverviewTab } from "./_components/OverviewTab";
import { ProfileTab } from "./_components/ProfileTab";
import { OrdersTab } from "./_components/OrdersTab";
import { SecurityTab } from "./_components/SecurityTab";
import { VALID_TABS, type ActiveTabType } from "./_components/types";
import ProductsSectionHeader from "../products/components/ProductsSectionHeader";
import ProductsGrid from "../products/components/ProductsGrid";
import { useRecentlyViewedProducts } from "@/features/products/hooks/useRecentlyViewedProducts";
import { ClockIcon } from "@/shared/ui/Icons";
import Breadcrumb from "@/shared/ui/Breadcrumb";

export default function AccountPage() {
  const t = useTranslations("profile");
  const tProducts = useTranslations("store.productsPage");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabParam = searchParams.get("tab") as ActiveTabType;
  const activeTab: ActiveTabType = VALID_TABS.includes(tabParam)
    ? tabParam
    : "overview";

  const handleTabChange = (tab: ActiveTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };
  const { products: recentlyViewedList } = useRecentlyViewedProducts();
  const { user, logout, isLoading: isAuthLoading } = useAuth();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Only redirect once the auth query has actually settled — on a hard
  // reload `user` starts out undefined while /auth/me-profile is still in
  // flight, so bailing out on `!user` alone would kick logged-in users to
  // the login page on every refresh.
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthLoading, user, router, locale]);

  // All hooks are declared above this point — safe to bail out now.
  // While the auth query is still settling (e.g. right after a hard
  // reload) or once it's settled with no user, render nothing interactive;
  // the effect above handles the actual redirect.
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen pt-36 pb-20 bg-background text-foreground transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header summary panel skeleton */}
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
                <div className="space-y-3 flex flex-col items-center sm:items-start">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Grid structure skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar skeleton */}
            <aside className="lg:col-span-3 flex flex-col gap-1.5 bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
              <Skeleton className="h-3 w-16 mx-3 mt-1 mb-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </aside>

            {/* Main content skeleton */}
            <main className="lg:col-span-9 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const serverAvatar =
    typeof user.avatar === "string" ? user.avatar : user.avatar?.url || null;
  const avatarUrl = localPreview !== null ? localPreview || null : serverAvatar;

  return (
    <div className="min-h-screen pt-36 pb-20 bg-background text-foreground transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal animation="fade">
          <Breadcrumb items={[{ label: t("title") }]} className="py-2" />
        </ScrollReveal>
        <AccountHeader
          user={user}
          locale={locale}
          t={t}
          avatarUrl={avatarUrl}
          onEditAvatar={() => handleTabChange("profile")}
          onLogout={() => logout()}
        />

        {/* Grid structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <AccountSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            t={t}
          />

          {/* Right Content Panel */}
          <main
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="lg:col-span-9"
          >
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <ScrollReveal
                key="overview"
                animation="fade"
                duration={700}
                className="space-y-8"
              >
                <OverviewTab
                  user={user}
                  locale={locale}
                  onViewAllOrders={() => handleTabChange("orders")}
                />
              </ScrollReveal>
            )}

            {/* TAB 2: PROFILE */}
            {activeTab === "profile" && (
              <ScrollReveal
                key="profile"
                animation="fade"
                duration={700}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <ProfileTab
                  user={user}
                  avatarUrl={avatarUrl}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  localPreview={localPreview}
                  setLocalPreview={setLocalPreview}
                />
              </ScrollReveal>
            )}

            {/* TAB 3: ORDERS */}
            {activeTab === "orders" && (
              <ScrollReveal
                key="orders"
                animation="fade"
                duration={700}
                className="space-y-4"
              >
                <OrdersTab locale={locale} />
              </ScrollReveal>
            )}

            {/* TAB 4: SECURITY */}
            {activeTab === "security" && (
              <ScrollReveal
                key="security"
                animation="fade"
                duration={700}
                className="space-y-4"
              >
                <SecurityTab />
              </ScrollReveal>
            )}
          </main>
        </div>
        {/* ─── 2. RECENTLY VIEWED ──────────────────────────────── */}
        {activeTab === "orders" && recentlyViewedList.length > 0 && (
          <section className="relative py-10 sm:py-14 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductsSectionHeader
                icon={ClockIcon}
                title={tProducts("recentlyViewedTitle")}
                description={tProducts("recentlyViewedDesc")}
              />
              <ProductsGrid
                items={recentlyViewedList}
                isLoading={false}
                emptyTitle={tProducts("noProducts")}
                emptyDesc={tProducts("noProductsDesc")}
                withReveal
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
