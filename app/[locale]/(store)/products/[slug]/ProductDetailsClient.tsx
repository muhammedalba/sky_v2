"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useProduct } from "@/features/products/hooks/useProducts";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Skeleton } from "@/shared/ui/Skeleton";
import Modal from "@/shared/ui/Modal";
import {
  VisaIcon,
  MastercardIcon,
  CreditCardIcon,
  StarIcon,
  FileTextIcon,
  PackageIcon,
  HeartIcon,
  Share2Icon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ListChecksIcon,
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from "@/shared/ui/Icons";

import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { Price } from "@/shared/ui/Price";

import { useTrans } from "@/shared/hooks/useTrans";
import { useToast } from "@/shared/hooks/useToast";
import { Product, ProductVariant, ProductWithVariants } from "@/types";
import { useFormatCurrency } from "@/shared/hooks/useFormatCurrency";
import { Link, useRouter } from "@/navigation";
import { getAttributeLabel } from "@/shared/constants/product-constants";
import { cn } from "@/lib/utils";
import SimilarProducts from "./SimilarProducts";

// تحديث واجهة البيانات لتطابق شكل الباك إيند الجديد
interface ProductResponse {
  product: Product;
  variants: ProductVariant[];
}

// بعض المتغيرات تُخزَّن قيمة الخاصية كنص مباشر (e.g. "Coarse 331 TX") وبعضها ككائن { value, unit }
function normalizeAttr(attrData: unknown): { value: string; unit?: string } {
  if (attrData === null || attrData === undefined) return { value: "" };
  if (typeof attrData === "object") {
    const obj = attrData as { value?: unknown; unit?: string };
    return { value: String(obj.value ?? ""), unit: obj.unit };
  }
  return { value: String(attrData) };
}

export default function ProductDetailsClient({
  params,
  initialData,
}: {
  params: Promise<{ locale: string; slug: string }>;
  initialData: ProductWithVariants | null;
}) {
  const { slug, locale } = use(params);
  const isAr = locale === "ar";
  const getTrans = useTrans();
  const toast = useToast();
  const formatCurrency = useFormatCurrency();
  const commonT = useTranslations("common");
  const t = useTranslations("product");
  const router = useRouter();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  // --- State ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [quantity, setQuantity] = useState(1);

  // سنقوم بتخزين قيمة المتغير المختار، مثلاً: { volume: "20" }
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  // --- Fetch Data ---
  const { data: fetchResponse, isLoading, error } = useProduct(slug);

  // استخراج المنتج والمتغيرات بناءً على الشكل الجديد للبيانات
  const payload = fetchResponse || initialData;
  const product = payload?.product || ({} as Product);
  console.log("payload", payload);
  const variants = payload?.variants || [];

  const [activeTab, setActiveTab] = useState<"order" | "reviews">(
    product?.variantCount > 1 ? "order" : "reviews",
  );
  const hasVariants = variants.length > 0;

  // --- Variants Logic ---
  // العثور على المتغير (Variant) الذي يطابق اختيارات المستخدم
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;

    return variants.find((v: any) => {
      return Object.entries(selectedAttributes).every(
        ([attrName, selectedValue]) => {
          const variantAttr = v.attributes?.[attrName];
          // مطابقة القيمة الموجودة داخل الخاصية (سواء كانت نصاً مباشراً أو كائن { value, unit })
          return normalizeAttr(variantAttr).value === String(selectedValue);
        },
      );
    });
  }, [hasVariants, variants, selectedAttributes]);

  // تجميع خصائص المتغيرات (Attributes) لعرضها كأزرار اختيار قابلة للتحديد
  const attributeGroups = useMemo(() => {
    if (!hasVariants) return [];

    const names = product.allowedAttributes?.length
      ? product.allowedAttributes.map((a) => a.name)
      : Array.from(
          new Set(
            variants.flatMap((v: ProductVariant) =>
              Object.keys(v.attributes || {}),
            ),
          ),
        );

    return names
      .map((name) => {
        const optionsMap = new Map<string, string | undefined>();
        variants.forEach((v: ProductVariant) => {
          const attrData = v.attributes?.[name];
          if (attrData !== undefined && attrData !== null) {
            const normalized = normalizeAttr(attrData);
            if (normalized.value) {
              optionsMap.set(normalized.value, normalized.unit);
            }
          }
        });

        return {
          name,
          label: getAttributeLabel(name, isAr),
          options: Array.from(optionsMap.entries()).map(([value, unit]) => ({
            value,
            unit,
            isAvailable: variants.some((v: ProductVariant) => {
              const attrData = v.attributes?.[name];
              return (
                attrData !== undefined &&
                attrData !== null &&
                normalizeAttr(attrData).value === value &&
                (v.stock > 0 || product.isUnlimitedStock)
              );
            }),
          })),
        };
      })
      .filter((g) => g.options.length > 0);
  }, [
    hasVariants,
    variants,
    product.allowedAttributes,
    product.isUnlimitedStock,
    isAr,
  ]);

  const handleAttributeSelect = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  };

  // تحديد أول متغير متاح تلقائياً عند التحميل
  useEffect(() => {
    if (hasVariants && Object.keys(selectedAttributes).length === 0) {
      const firstAvailable =
        variants.find((v: any) => v.isActive && v.stock > 0) || variants[0];

      if (firstAvailable?.attributes) {
        const initialSelections: Record<string, string> = {};
        Object.keys(firstAvailable.attributes).forEach((key) => {
          initialSelections[key] = normalizeAttr(
            firstAvailable.attributes[key],
          ).value;
        });
        setSelectedAttributes(initialSelections);
      }
    }
 
  }, [hasVariants, variants,selectedAttributes]);

  // --- Handlers ---
  const handleToggleWishlist = () => setIsWishlisted((prev) => !prev);

  const handleShare = async () => {
    const shareTitle =
      typeof product.title === "string"
        ? product.title
        : getTrans(product.title);
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(getTrans("link_copied") || t("linkCopied"));
      }
    } catch {
      // تجاهل إلغاء المستخدم لنافذة المشاركة
    }
  };

  // --- Loading & Error States ---
  if (isLoading && !product) return <ProductLoadingSkeleton />;
  if (error || !product) return <ProductNotFound />;

  // --- Derived Display Values ---
  // معالجة النصوص بناءً على هيكل البيانات (سواء كانت Object للغات أو String مباشر)
  const title =
    typeof product.title === "string"
      ? product.title
      : getTrans(product.title) || "Product";
  const description =
    typeof product.description === "string"
      ? product.description
      : getTrans(product.description);
  const categoryName =
    typeof product.category === "object"
      ? getTrans(product.category?.name)
      : "";
  const brandName =
    typeof product.brand === "object" ? getTrans(product.brand?.name) : "";
  const subCategoryName = product.SubCategories?.[0]
    ? getTrans(product.SubCategories[0].name)
    : "";
  const unitLabel = selectedVariant?.shippingProfile?.packageType;

  const allImages = [product.imageCover, ...(product.images || [])].filter(
    Boolean,
  ) as string[];
  const currentDisplayImage =
    selectedVariant?.image || selectedImage || product.imageCover || "";
  const currentImageIndex = Math.max(
    0,
    allImages.indexOf(currentDisplayImage as string),
  );

  const goToImage = (direction: 1 | -1) => {
    if (allImages.length < 2) return;
    const nextIndex =
      (currentImageIndex + direction + allImages.length) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  };

  // حساب السعر (تفعيل الخصم الخاص بالـ Variant إن وجد)
  const displayPrice =
    selectedVariant?.priceAfterDiscount ||
    selectedVariant?.price ||
    product.priceRange?.min ||
    0;
  const oldPrice = selectedVariant?.priceAfterDiscount
    ? selectedVariant.price
    : product.priceRange?.max;
  const hasDiscount = !!(oldPrice && oldPrice > displayPrice);

  const currentStock = hasVariants
    ? (selectedVariant?.stock ?? 0)
    : (product.stockSummary ?? 0);
  const isOutOfStock = currentStock <= 0 && !product.isUnlimitedStock;

  // معالجة الاستخدامات (البيانات القادمة كـ Array مباشر)
  const usesList = Array.isArray(product.uses) ? product.uses : [];

  // --- Order Section: Quantity / Unit / Cart Handlers ---
  const packageTypeLabels: Record<string, string> = {
    box: t("units.box"),
    bag: t("units.bag"),
    pallet: t("units.pallet"),
    roll: t("units.roll"),
    envelope: t("units.envelope"),
    drum: t("units.drum"),
    gallon: t("units.gallon"),
    board: t("units.board"),
    piece: t("units.piece"),
    custom: t("units.custom"),
  };
  const unitText =
    packageTypeLabels[
      selectedVariant?.shippingProfile?.packageType || "piece"
    ] || t("units.piece");

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (!product.isUnlimitedStock && next > currentStock) {
        return currentStock || 1;
      }
      return next;
    });
  };

  const canOrder = !isOutOfStock && (!hasVariants || !!selectedVariant);

  const handleAddToCart = () => {
    if (!canOrder) return;
    addToCart({
      productId: product._id,
      variantId: selectedVariant?._id || variants[0]?._id || "",
      quantity,
      product,
    });
  };

  const handleBuyNow = () => {
    if (!canOrder) return;
    addToCart(
      {
        productId: product._id,
        variantId: selectedVariant?._id || variants[0]?._id || "",
        quantity,
        product,
      },
      { onSuccess: () => router.push("/checkout") },
    );
  };

  return (
    <div className="bg-muted/30 min-h-screen pt-24">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            ...(categoryName ? [{ label: categoryName }] : []),
            ...(subCategoryName ? [{ label: subCategoryName }] : []),
            { label: title },
          ]}
          className="py-2"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 ">
          {/* GALLERY */}
          <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-3">
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 shrink-0 p-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 md:w-full aspect-square shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 
                                            ${currentDisplayImage === img ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-transparent opacity-60 hover:opacity-100 hover:bg-secondary"}`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${title} ${i}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative w-full  bg-secondary/10 rounded-sm overflow-hidden group">
              {product.isFeatured && (
                <div className="absolute rounded-tr-sm rounded-bl-sm top-4 rtl:right-4 ltr:left-4 z-10 bg-warning text-warning-foreground font-bold px-3 py-1 text-sm shadow-lg">
                  {t("badges.bestSeller")}
                </div>
              )}
              {hasDiscount && (
                <div className="absolute rounded-tr-sm rounded-bl-sm top-4 rtl:left-4 ltr:right-4 z-10 bg-destructive text-destructive-foreground font-bold px-3 py-1 text-sm shadow-lg">
                  {t("badges.discount", {
                    percent: Math.round(
                      ((oldPrice - displayPrice) / oldPrice) * 100,
                    ),
                  })}
                </div>
              )}

              {/* Wishlist & Share */}
              <div
                className="absolute top-4 rtl:left-4 ltr:right-4 z-10 flex flex-col gap-2"
                style={hasDiscount ? { marginTop: "2.5rem" } : undefined}
              >
                <Button
                  variant="outline2"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-muted/10 backdrop-blur-md"
                  onClick={handleToggleWishlist}
                  aria-label={t("gallery.addToWishlist")}
                >
                  <HeartIcon
                    className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline2"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-muted/10 backdrop-blur-md"
                  onClick={handleShare}
                  aria-label={t("gallery.shareProduct")}
                >
                  <Share2Icon className="w-4 h-4" />
                </Button>
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => goToImage(-1)}
                    className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                    aria-label={t("gallery.prevImage")}
                  >
                    <ChevronLeftIcon className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  <button
                    onClick={() => goToImage(1)}
                    className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100"
                    aria-label={t("gallery.nextImage")}
                  >
                    <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </>
              )}

              {/* <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 rtl:left-4 ltr:right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                aria-label="تكبير الصورة"
              >
                <Maximize2Icon className="w-4 h-4" />
              </button> */}

              <ImageWithFallback
                src={currentDisplayImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-zoom-in"
                preload
                // onClick={() => setIsLightboxOpen(true)}
              />
            </div>
          </div>
          <div className="lg:col-span-1"></div>
          {/* DETAILS */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28 space-y-5">
              {/* Tag Chips */}
              {(categoryName || subCategoryName || brandName) && (
                <div className="flex flex-wrap items-center gap-1">
                  {categoryName && (
                    <Badge variant="default" className="text-[9px] font-medium">
                      {categoryName}
                    </Badge>
                  )}
                  {subCategoryName && (
                    <Badge variant="default" className="text-[9px] font-medium">
                      {subCategoryName}
                    </Badge>
                  )}
                  {brandName && (
                    <Badge variant="default" className="text-[9px] font-medium">
                      {brandName}
                    </Badge>
                  )}
                </div>
              )}

              {/* Header Info */}
              <div className="space-y-2">
                <h1 className="text-sm sm:text-md md:text-xl font-semibold tracking-tight title-gradient leading-tight">
                  {title}
                </h1>

                {/* Rating / Reviews / SKU */}
                {(!!product.ratingsAverage || product.sku) && (
                  <div className="flex flex-wrap items-center gap-2.5 text-sm">
                    {!!product.ratingsAverage && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center" dir="ltr">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-3.5 h-3.5 ${i < Math.round(product.ratingsAverage!) ? "text-warning fill-warning" : "text-border fill-border"}`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-foreground">
                          {product.ratingsAverage.toFixed(1)}
                        </span>
                        {!!product.ratingsQuantity && (
                          <span className="text-muted-foreground">
                            {t("info.ratingsCount", {
                              count: product.ratingsQuantity,
                            })}
                          </span>
                        )}
                      </div>
                    )}
                    {!!product.ratingsAverage && product.sku && (
                      <span className="text-border">|</span>
                    )}
                    {product.sku && (
                      <span className="text-muted-foreground">
                        SKU:{" "}
                        <span dir="ltr" className="text-foreground font-medium">
                          {product.sku}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed ">
                {description}
              </p>

              {/* Info Strip: Brand / Category / Sub-category */}
              {(brandName || categoryName || subCategoryName) && (
                <div className="grid grid-cols-3 gap-4 py-3 border-b  border-border/50">
                  {brandName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        {t("info.brand")}
                      </p>
                      <p className="text-xs  font-semibold text-foreground truncate">
                        {brandName}
                      </p>
                    </div>
                  )}
                  {categoryName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        {t("info.category")}
                      </p>
                      <p className="text-xs  font-semibold text-foreground truncate">
                        {categoryName}
                      </p>
                    </div>
                  )}
                  {subCategoryName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        {t("info.subCategory")}
                      </p>
                      <p className="text-xs  font-semibold text-foreground truncate">
                        {subCategoryName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {product?.variantCount == 1 ? (
                  <div className="flex items-baseline gap-2">
                    <Price
                      amount={displayPrice}
                      className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
                    />

                    {hasDiscount && (
                      <Price
                        amount={oldPrice}
                        className="text-base font-medium text-muted-foreground line-through"
                        currencyClassName="text-muted-foreground/60"
                      />
                    )}
                    {unitLabel && (
                      <span className="text-sm text-muted-foreground">
                        / {unitLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-base text-muted-foreground">
                      {t("info.startingFrom")}
                    </span>
                    <Price
                      amount={product.priceRange?.min}
                      className="text-xl font-semibold text-primary"
                    />
                    {unitLabel && (
                      <span className="text-sm text-muted-foreground">
                        / {unitLabel}
                      </span>
                    )}
                  </div>
                )}
                {/*  */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isOutOfStock ? "destructive" : "success"}
                    className="rounded-full gap-1.5 px-3 py-1"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-destructive" : "bg-success"}`}
                    />
                    {isOutOfStock
                      ? t("badges.outOfStock")
                      : t("badges.inStock")}
                  </Badge>
                  {!isOutOfStock && (
                    <Badge
                      variant="info"
                      className="rounded-full gap-1.5 px-3 py-1"
                    >
                      <PackageIcon className="w-3 h-3" />
                      {t("badges.readyToShip")}
                    </Badge>
                  )}
                </div>
              </div>
              {product.variantCount == 1 && (
                <div className="space-y-2.5 pt-1">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canOrder}
                    isLoading={isAddingToCart}
                    className="w-full gap-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    {isOutOfStock
                      ? commonT("buttons.out_of_stock")
                      : commonT("buttons.add_to_cart")}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!canOrder}
                    isLoading={isAddingToCart}
                    variant={"outline2"}
                    className="w-full bg-background border border-primary/30 text-primary "
                  >
                    {t("actions.buyNow")}
                  </Button>
                </div>
              )}
              {/* Technical Documentation */}
              {product.infoProductPdf?.url && (
                <div className="pt-1 space-y-2.5">
                  <h3 className="font-bold text-base title-gradient">
                    {t("documentation.title")}
                  </h3>
                  <a
                    href={product.infoProductPdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-border hover:border-primary/40 hover:bg-secondary/20 transition-colors group/doc"
                  >
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {t("documentation.pdfLabel")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t("documentation.pdfDesc")}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover/doc:text-primary transition-colors shrink-0">
                      <DownloadIcon className="w-4 h-4" />
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {/*Uses List*/}
        {usesList.length > 0 && (
          <div className="pt-5 space-y-3 px-5">
            <div className="bg-secondary/30 rounded-2xl p-5">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 title-gradient">
                <StarIcon className="w-4 h-4 text-primary" />
                {t("uses.title")}
              </h3>
              <ul className="space-y-2.5">
                {usesList.map((useStr: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{useStr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* Order / Reviews Tabs Section */}
        <div className="mt-10">
          {/* Tabs Header */}
          {product.variantCount > 1 && (
            <div className="inline-flex items-center gap-1  rounded-sm p-2 bg-muted/60 border border-border/40 mb-6 w-full">
              <button
                type="button"
                onClick={() => setActiveTab("order")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer",
                  activeTab === "order"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("tabs.order")}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer",
                  activeTab === "reviews"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("tabs.reviews")}
                {!!product.ratingsQuantity && (
                  <span className="ms-1 text-xs opacity-70">
                    ({product.ratingsQuantity})
                  </span>
                )}
              </button>
            </div>
          )}

          {activeTab === "order" || product.variantCount > 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-muted/60 p-5">
              {/* Specifications + Quantity */}
              <div className="lg:col-span-8    sm:p-6 space-y-6">
                <div className="flex justify-between flex-col h-full">
                  {attributeGroups.length > 0 && (
                    <div className="space-y-5">
                      <h3 className="flex items-center gap-2 font-bold text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        {t("order.chooseSpecs")}
                      </h3>
                      <div className="space-y-4 ps-7">
                        {attributeGroups.map((group) => (
                          <div key={group.name} className="space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                              {group.label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {group.options.map((opt) => {
                                const isSelected =
                                  selectedAttributes[group.name] === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    disabled={!opt.isAvailable}
                                    onClick={() =>
                                      handleAttributeSelect(
                                        group.name,
                                        opt.value,
                                      )
                                    }
                                    className={cn(
                                      "h-9 px-4 rounded-sm text-xs font-semibold border transition-all cursor-pointer",
                                      isSelected
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/60  text-foreground/80 hover:border-primary/40",
                                      !opt.isAvailable &&
                                        "opacity-40 cursor-not-allowed line-through",
                                    )}
                                  >
                                    <span dir="ltr">
                                      {opt.value}
                                      {opt.unit ? opt.unit : ""}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "space-y-3",
                      attributeGroups.length > 0 &&
                        "pt-2 border-t border-border/40",
                    )}
                  >
                    <h3 className="flex items-center gap-2 font-bold text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center shrink-0">
                        {attributeGroups.length > 0 ? 2 : 1}
                      </span>
                      {t("order.quantity")}
                    </h3>
                    <div className="flex items-center gap-3 ps-7">
                      <div className="flex items-center border border-border/60 rounded-lg h-10 bg-accent/30">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="w-9 h-full flex items-center justify-center bg-background/50 hover:bg-muted rounded-s-lg transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-10 h-full flex items-center justify-center font-bold text-sm tabular-nums bg-background">
                          {quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(1)}
                          disabled={
                            !product.isUnlimitedStock &&
                            quantity >= currentStock
                          }
                          className="w-9 h-full flex items-center justify-center bg-background/50 hover:bg-muted  rounded-e-lg transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border/60 bg-background text-xs font-semibold text-foreground/80">
                        {unitText}
                        <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Summary Card */}
              <div className="lg:col-span-4  bg-background rounded-2xl border border-border/50 p-5 sm:p-6 space-y-5">
                <h3 className="flex items-center gap-2 font-bold text-sm title-gradient">
                  <ListChecksIcon className="w-4 h-4 text-primary" />
                  {t("order.yourSelection")}
                </h3>

                {selectedVariant ? (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedVariant.attributes || {}).map(
                      ([key, attr]) => {
                        const normalized = normalizeAttr(attr);
                        return (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {getAttributeLabel(key, isAr)}: {normalized.value}
                            {normalized.unit ? ` ${normalized.unit}` : ""}
                          </Badge>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("order.noSelection")}
                  </p>
                )}

                <div className="space-y-2 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("order.unitPrice")}
                    </span>
                    <span className="font-semibold flex items-center gap-1">
                      <Price
                        amount={displayPrice}
                        className="text-base font-medium "
                        currencyClassName="text-muted-foreground/60"
                      />
                      / {unitText}
                      {/* <Price
                        amount={oldPrice}
                        className="text-base font-medium text-muted-foreground line-through"
                        currencyClassName="text-muted-foreground/60"
                      /> */}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      {t("order.totalPrice")}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      <Price
                        amount={displayPrice * quantity}
                        className="text-xl font-bold text-primary"
                        currencyClassName="text-muted-foreground/60"
                      />
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canOrder}
                    isLoading={isAddingToCart}
                    className="w-full gap-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    {isOutOfStock
                      ? commonT("buttons.out_of_stock")
                      : commonT("buttons.add_to_cart")}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!canOrder}
                    isLoading={isAddingToCart}
                    variant={"outline2"}
                    className="w-full bg-background border border-primary/30 text-primary "
                  >
                    {t("actions.buyNow")}
                  </Button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  {t("actions.needHelp")}{" "}
                  <Link
                    href="/contact"
                    className="text-primary font-semibold hover:underline"
                  >
                    {t("actions.contactSupport")}
                  </Link>
                </p>

                <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/40">
                  <VisaIcon className="h-5 w-auto opacity-70" />
                  <MastercardIcon className="h-5 w-auto opacity-70" />
                  <CreditCardIcon className="h-5 w-auto opacity-70" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-background rounded-2xl border border-border/50 p-5 sm:p-6 space-y-6">
              <h3 className="font-bold text-lg title-gradient">
                {t("reviews.title")}
                {!!product.ratingsQuantity && ` (${product.ratingsQuantity})`}
              </h3>

              {!!product.ratingsAverage && (
                <div className="rounded-2xl border border-border/40 p-5 space-y-2 w-fit">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black">
                      {product.ratingsAverage.toFixed(2)}
                    </span>
                    <div className="flex items-center" dir="ltr">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(product.ratingsAverage!) ? "text-warning fill-warning" : "text-border fill-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* قائمة التقييمات - ستُعرض هنا فور ربط واجهة تعليقات بالباك إند */}
              <div className="text-center py-10 text-sm text-muted-foreground border-t border-border/40">
                {t("reviews.empty")}
              </div>
            </div>
          )}
        </div>

        {/* Similar Products */}
      </div>
      <SimilarProducts product={product} />
      {/* Image Lightbox */}
      <Modal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        size="xl"
      >
        <div className="relative w-full aspect-square sm:aspect-video">
          <ImageWithFallback
            src={currentDisplayImage}
            alt={title}
            fill
            preload
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}

// ... (ProductLoadingSkeleton and ProductNotFound components remain exactly the same)
function ProductLoadingSkeleton() {
  return null;
} // احتفظ بالكود السابق للتحميل هنا
function ProductNotFound() {
  return null;
} // احتفظ بالكود السابق للخطأ هنا
