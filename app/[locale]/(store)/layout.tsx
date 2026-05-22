import { ReactNode } from "react";
import MobileBottomNavLoader from "@/components/navigation/MobileBottomNavLoader";
import StoreNavbarLoader from "@/components/navigation/StoreNavbarLoader";
import StoreFooter from "@/widgets/layout/StoreFooter";
import { env } from "@/lib/env";
import type { CategoryItem } from "@/components/navigation/CategoriesScroller";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import TopPromoBanner from "@/components/navigation/TopPromoBanner";
import type { PromoBanner } from "@/features/marketing/types";

// ─── Server-side Data Fetch ───────────────────────────────────────────────────

async function getCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.CATEGORIES.BASE}?limit=20`,
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) return [];

    const json = await res.json();
    const data: CategoryItem[] = json?.data || [];
    if (!Array.isArray(data)) return [];

    return data;
  } catch {
    return [];
  }
}

async function getActivePromoBanner(): Promise<PromoBanner | null> {
  try {
    const res = await fetch(
      `${env.API_URL}${env.ENDPOINTS.PROMO_BANNER.ACTIVE}`,
      {
        next: { revalidate: 60 },
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// Settings are fetched once in [locale]/layout.tsx via the shared
// getStoreSettings() (shared/api/settings.ts) with ISR cache tag 'settings'.
// They reach all client components through SettingsProvider — no extra fetch needed here.

// ─── Layout ───────────────────────────────────────────────────────────────────

interface StoreLayoutProps {
  children: ReactNode;
}

export default async function StoreLayout({ children, params }: StoreLayoutProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const categories = await getCategories();
  const promoBanner = await getActivePromoBanner();
  const allMessages = await getMessages();

  console.log(promoBanner);
  

  // Pick only customer-facing storefront messages to avoid admin bloat
  const storeMessages = {
    // Root layout messages
    common: allMessages.common,
    auth: allMessages.auth,
    buttons: allMessages.buttons,
    errors: allMessages.errors,
    navigation: allMessages.navigation,
    messages: allMessages.messages,
    shipping: allMessages.shipping,
    shippingRates: allMessages.shippingRates,
    taxes: allMessages.taxes,
    maintenance: allMessages.maintenance,
    notifications: allMessages.notifications,
    // Storefront layout messages
    store: allMessages.store,
    home: allMessages.home,
    contact: allMessages.contact,
    products: allMessages.products,
    categories: allMessages.categories,
    subCategories: allMessages.subCategories,
    cart: allMessages.cart,
    quote: allMessages.quote,
    brands: allMessages.brands,
    carousel: allMessages.carousel,
    promoBanners: allMessages.promoBanners,
    coupons: allMessages.coupons,
    settings: allMessages.settings,
    locations: allMessages.locations,
    profile: allMessages.profile,
    orders: allMessages.orders,
  };

  return (
    <NextIntlClientProvider messages={storeMessages}>
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased pt-(--promo-banner-height,0px) transition-[padding-top] duration-300 ease-in-out">
        {/* Top promo banner */}
        <TopPromoBanner banner={promoBanner} />

        {/* Top Navigation — Mobile & Desktop handled internally */}
        <StoreNavbarLoader categories={categories} />

        <main className="flex-1  pb-[calc(56px+env(safe-area-inset-bottom,0))] md:pb-0">
          {children}
        </main>

        {/* Footer */}
        <StoreFooter />

        {/* Mobile-only bottom navigation */}
        <MobileBottomNavLoader />
      </div>
    </NextIntlClientProvider>
  );
}
