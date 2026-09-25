"use client";
import { useMemo, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import {
  useWishlist,
  useClearWishlist,
} from "@/features/wishlist/hooks/useWishlist";
import { useWishlistStore } from "@/store/wishlist-store";
import { useMe } from "@/features/auth/hooks/useAuth";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import SimilarProductCard from "@/components/SimilarProductCard";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HeartIcon,
  TrashIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { Product } from "@/types";

const noopSubscribe = () => () => {};

/* ------------------------------------------------------------------ */
/* Page                                                              */
/* ------------------------------------------------------------------ */
export default function WishlistPage() {
  // ======> Hooks <======
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const isAr = locale === "ar";

  // Guest items live in localStorage → only read them after hydration
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // ======> Data <======
  const { data: user } = useMe();
  const { data: serverWishlist, isLoading } = useWishlist();
  const guestItems = useWishlistStore((state) => state.items);
  const { mutate: clearWishlist, isPending: isClearing } = useClearWishlist();

  // ======> wishlist products (newest first) <======
  const products = useMemo<Product[]>(() => {
    if (user) return serverWishlist?.products ?? [];
    if (!hydrated) return [];
    return [...guestItems].reverse().map((item) => item.product);
  }, [user, serverWishlist?.products, hydrated, guestItems]);

  /* ── Loading ── */
  if ((isLoading && user) || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {t("misc.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-24 bg-accent/70 selection:bg-primary/20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <ScrollReveal animation="fade" delay={200}>
          <Breadcrumb
            items={[{ label: t("misc.home"), href: "/" }, { label: t("title") }]}
          />
        </ScrollReveal>

        {/* ── Empty State ── */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto gap-6">
            <div className="w-28 h-28 rounded-full bg-accent flex items-center justify-center">
              <ScrollReveal animation="slide-up" delay={100}>
                <HeartIcon className="w-14 h-14 text-muted-foreground/40" />
              </ScrollReveal>
            </div>
            <ScrollReveal animation="slide-up" delay={100}>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {t("empty.title")}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("empty.subtitle")}
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex mt-3 items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3.5 font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-[1.02]"
              >
                {t("empty.cta")}
                {isAr ? (
                  <ArrowLeftIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </Link>
            </ScrollReveal>
          </div>
        ) : (
          <div className="w-full">
            {/* Page heading + clear */}
            <div className="flex items-center justify-between">
              <ScrollReveal animation="slide-right">
                <div className="flex items-center gap-2">
                  <HeartIcon className="size-8 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold title-gradient tracking-tight">
                    {t("title")}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {products.length}
                  {products.length === 1
                    ? t("misc.item_count_single")
                    : t("misc.item_count_plural")}
                </p>
              </ScrollReveal>
              <ScrollReveal animation="slide-left">
                <button
                  onClick={() => clearWishlist()}
                  disabled={isClearing}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <TrashIcon
                    className={`w-4 h-4 text-destructive ${isClearing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">{t("actions.clear")}</span>
                </button>
              </ScrollReveal>
            </div>

            {/* ── Products Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-6">
              {products.map((product) => (
                <SimilarProductCard key={product._id} item={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
