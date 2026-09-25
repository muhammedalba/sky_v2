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
import CurrencyToggleLoader from "@/widgets/currency/CurrencyToggleLoader";
import UsdApproximateNoticeModal from "@/widgets/currency/UsdApproximateNoticeModal";
import { serverFetch } from "@/shared/api/server-fetch";

// ─── Server-side Data Fetch ───────────────────────────────────────────────────

// Bounds worst-case fetch latency so a slow/unreachable backend can never
// stall this layout indefinitely — falls through to the existing catch-block
// fallback exactly like any other fetch failure.
const FETCH_TIMEOUT_MS = 5000;

async function getCategories(locale: string): Promise<CategoryItem[]> {
  try {
    const res = await serverFetch(
      `${env.API_URL}${env.ENDPOINTS.CATEGORIES.BASE}?limit=20`,
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json", "Accept-Language": locale, },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

async function getActivePromoBanner(locale: string): Promise<PromoBanner | null> {
  try {
    const res = await serverFetch(
      `${env.API_URL}${env.ENDPOINTS.PROMO_BANNER.ACTIVE}`,
      {
        next: { revalidate: 60, tags: ["promo-banner"] },
        headers: { "Content-Type": "application/json", "Accept-Language": locale, },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

  const [categories, promoBanner, allMessages] = await Promise.all([
    getCategories(locale),
    getActivePromoBanner(locale),
    getMessages(),
  ]);

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
    notifications: allMessages.notifications,
    // Storefront layout messages
    store: allMessages.store,
    home: allMessages.home,
    contact: allMessages.contact,
    products: allMessages.products,
    product: allMessages.product,
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
    reviews: allMessages.reviews,
    wishlist: allMessages.wishlist,
  };

  return (
    <NextIntlClientProvider messages={storeMessages}>
      <div className="min-h-screen pb-20 sm:pb-0 overflow-x-hidden flex flex-col bg-background font-sans antialiased pt-(--promo-banner-height,0px) transition-[padding-top]">
        {/* Top promo banner */}
        <TopPromoBanner banner={promoBanner} />

        {/* Top Navigation — Mobile & Desktop handled internally */}
        <StoreNavbarLoader categories={categories} />

        <main className="flex-1  pb-[calc(56px+env(safe-area-inset-bottom,0))] md:pb-0">
          {children}
        </main>

        {/* Footer */}
        <StoreFooter locale={locale as "ar" | "en"} />

        {/* Mobile-only bottom navigation */}
        <MobileBottomNavLoader />

        {/* Manual currency override toggle — draggable variant on home, fixed elsewhere */}
        <CurrencyToggleLoader />

        {/* Single shared instance — triggered from the currency toggle and the locale switcher */}
        <UsdApproximateNoticeModal />
      </div>
    </NextIntlClientProvider>
  );
}
