"use client";

import { useState, use, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useProduct } from "@/features/products/hooks/useProducts";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";
import { useTrans } from "@/shared/hooks/useTrans";
import { useToast } from "@/shared/hooks/useToast";
import { Link, useRouter } from "@/navigation";
import { ChevronLeftIcon } from "@/shared/ui/Icons";
import { getAttributeLabel } from "@/shared/constants/product-constants";
import { formatVariantAttributesText } from "@/shared/ui/VariantAttributes";
import { cn } from "@/lib/utils";
import { ProductVariant, ProductWithVariants } from "@/types";
import { FileAsset } from "@/shared/types/file-asset";

import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductUsesList from "./components/ProductUsesList";
import ProductVariantSelector, {
  AttributeGroup,
} from "./components/ProductVariantSelector";
import ProductOrderCard from "./components/ProductOrderCard";
import ProductReviewsTab from "./components/ProductReviewsTab";
import ProductLightboxModal from "./components/ProductLightboxModal";
import {
  ProductLoadingSkeleton,
  ProductNotFound,
} from "./components/ProductSkeletons";
import SimilarProducts from "./SimilarProducts";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

// بعض المتغيرات تُخزَّن قيمة الخاصية كنص مباشر (e.g. "Coarse 331 TX") وبعضها ككائن { value, unit }
function normalizeAttr(attrData: unknown): { value: string; unit?: string } {
  if (attrData === null || attrData === undefined) return { value: "" };
  if (typeof attrData === "object") {
    const obj = attrData as { value?: unknown; unit?: string };
    return { value: String(obj.value ?? ""), unit: obj.unit };
  }
  return { value: String(attrData) };
}

function getInitialVariantAttributes(
  variantsList?: ProductVariant[],
): Record<string, string> {
  if (!variantsList || variantsList.length === 0) return {};
  const firstAvailable =
    variantsList.find((v: ProductVariant) => v.isActive && v.stock > 0) ||
    variantsList[0];

  if (!firstAvailable?.attributes) return {};
  const initialSelections: Record<string, string> = {};
  Object.keys(firstAvailable.attributes).forEach((key) => {
    initialSelections[key] = normalizeAttr(
      firstAvailable.attributes[key],
    ).value;
  });
  return initialSelections;
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
  const t = useTranslations("product");
  const router = useRouter();

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart(false);

  // --- State ---
  const [selectedImage, setSelectedImage] = useState<FileAsset | string | null>(
    null,
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => getInitialVariantAttributes(initialData?.variants));

  // --- Fetch Data ---
  const { data: payload, isLoading, error } = useProduct(slug, { initialData });

  const product = payload?.product;
  const variants = useMemo(() => payload?.variants || [], [payload?.variants]);
  const hasVariants = variants.length > 0;

  const [activeTab, setActiveTab] = useState<"order" | "reviews">(
    (product?.variantCount ?? 0) > 1 ? "order" : "reviews",
  );

  // الخصائص الافتراضية لأول متغير متاح
  const defaultAttributes = useMemo(
    () => getInitialVariantAttributes(variants),
    [variants],
  );

  // الخصائص النشطة الفعلية: تدمج الافتراضية مع اختيارات المستخدم
  const activeAttributes = useMemo(() => {
    return {
      ...defaultAttributes,
      ...selectedAttributes,
    };
  }, [defaultAttributes, selectedAttributes]);

  // المتغير المحدد المطابق للاختيارات الحالية
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;

    return (
      variants.find((v: ProductVariant) => {
        return Object.entries(activeAttributes).every(
          ([attrName, selectedValue]) => {
            const variantAttr = v.attributes?.[attrName];
            return normalizeAttr(variantAttr).value === String(selectedValue);
          },
        );
      }) || null
    );
  }, [hasVariants, variants, activeAttributes]);

  // تجميع خصائص المتغيرات (Attributes)
  const attributeGroups: AttributeGroup[] = useMemo(() => {
    if (!hasVariants || !product) return [];

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
                (v.stock > 0 || Boolean(product.isUnlimitedStock))
              );
            }),
          })),
        };
      })
      .filter((g) => g.options.length > 0);
  }, [hasVariants, variants, product, isAr]);

  // --- Handlers ---
  const handleAttributeSelect = useCallback(
    (name: string, value: string) => {
      setSelectedAttributes((prev) => ({
        ...defaultAttributes,
        ...prev,
        [name]: value,
      }));
      setQuantity(1);
    },
    [defaultAttributes],
  );

  const handleToggleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
  }, []);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const rawTitle =
      typeof product.title === "string"
        ? product.title
        : getTrans(product.title);
    const attrsSummary = selectedVariant
      ? formatVariantAttributesText(selectedVariant.attributes, (key) =>
          getAttributeLabel(key, isAr),
        )
      : "";
    const shareTitle = attrsSummary
      ? `${rawTitle} (${attrsSummary})`
      : rawTitle;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(getTrans("link_copied") || t("linkCopied"));
      }
    } catch {
      // تجاهل إلغاء نافذة المشاركة
    }
  }, [product, selectedVariant, isAr, getTrans, t, toast]);

  // --- Loading & Error Guards ---
  const isProductLoaded = Boolean(product && (product._id || product.id));

  if (isLoading && !isProductLoaded) return <ProductLoadingSkeleton />;
  if (error || (!isLoading && !isProductLoaded) || !product) {
    return <ProductNotFound />;
  }

  // --- Derived Values ---
  const title = getTrans(product.title) || "Product";
  const description = getTrans(product.description);
  const categoryName =
    typeof product.category === "object"
      ? getTrans(product.category?.name)
      : "-";
  const brandName =
    typeof product.brand === "object" ? getTrans(product.brand?.name) : "-";
  const subCategoryName = product.SubCategories?.[0]
    ? getTrans(product.SubCategories[0].name)
    : "-";
  const unitLabel = selectedVariant?.shippingProfile?.packageType;

  const categoryId =
    typeof product.category === "object"
      ? product.category?._id
      : typeof product.category === "string"
        ? product.category
        : "";
  const categoryHref = categoryId
    ? `/products?category=${categoryId}`
    : "/products";

  const subCategoryId = product.SubCategories?.[0]?._id;
  const subCategoryHref = subCategoryId
    ? `/products?category=${categoryId}&subCategory=${subCategoryId}`
    : undefined;

  const allImages = [product.imageCover, ...(product.images || [])].filter(
    Boolean,
  ) as (FileAsset | string)[];
  const currentDisplayImage =
    selectedVariant?.image || selectedImage || product.imageCover || "";

  // حساب السعر
  const displayPrice =
    selectedVariant?.priceAfterDiscount ||
    selectedVariant?.price ||
    product.priceRange?.min ||
    0;
  const oldPrice =
    (selectedVariant?.priceAfterDiscount
      ? selectedVariant.price
      : product.comparePrice || product.priceRange?.max) ?? 0;
  const hasDiscount = Boolean(oldPrice > displayPrice && displayPrice > 0);
  const discountPercent =
    hasDiscount && oldPrice > 0
      ? Math.round(((oldPrice - displayPrice) / oldPrice) * 100)
      : undefined;

  const currentStock = hasVariants
    ? (selectedVariant?.stock ?? 0)
    : (product.stockSummary ?? 0);
  const isOutOfStock = currentStock <= 0 && !product.isUnlimitedStock;

  const packageType = selectedVariant?.shippingProfile?.packageType || "piece";
  const unitText = t.has(`units.${packageType}`)
    ? t(`units.${packageType}` as "units.piece")
    : t("units.piece");

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

  const canOrder = !isOutOfStock && (!hasVariants || Boolean(selectedVariant));

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

  const usesList = Array.isArray(product.uses)
    ? product.uses
    : product.uses?.[isAr ? "ar" : "en"] || [];

  return (
    <div className="bg-muted/30 min-h-screen pt-24">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Desktop Breadcrumbs */}
        <div className="hidden sm:block">
          <ScrollReveal animation="fade">
            <Breadcrumb
              items={[
                ...(categoryName && categoryName !== "-"
                  ? [{ label: categoryName, href: categoryHref }]
                  : []),
                ...(subCategoryName && subCategoryName !== "-"
                  ? [{ label: subCategoryName, href: subCategoryHref }]
                  : []),
                { label: title },
              ]}
              className="py-2"
            />
          </ScrollReveal>
        </div>

        {/* Mobile Compact Back Navigation */}
        <div className="flex sm:hidden items-center py-2 mb-2">
              <ScrollReveal animation="fade">
          <Link
            href={categoryHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeftIcon className="w-4 h-4 rtl:rotate-180 text-primary group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
            <span>
              {categoryName && categoryName !== "-"
                ? categoryName
                : t("notFound.backToProducts")}
            </span>
          </Link></ScrollReveal>
        </div>

        {/* Gallery & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <ProductGallery
            title={title}
            images={allImages}
            currentDisplayImage={currentDisplayImage}
            onSelectImage={setSelectedImage}
            onOpenLightbox={() => setIsLightboxOpen(true)}
            isFeatured={product.isFeatured}
            hasDiscount={hasDiscount}
            discountPercent={discountPercent}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleToggleWishlist}
            onShare={handleShare}
          />

          <ProductInfo
            product={product}
            title={title}
            description={description}
            categoryName={categoryName}
            subCategoryName={subCategoryName}
            brandName={brandName}
            unitLabel={unitLabel}
            displayPrice={displayPrice}
            oldPrice={oldPrice}
            hasDiscount={hasDiscount}
            isOutOfStock={isOutOfStock}
            canOrder={canOrder}
            isAddingToCart={isAddingToCart}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        {/* Uses List */}
        <ProductUsesList uses={usesList} />

        {/* Order / Reviews Tabs Section */}
        <div className="mt-10">
          {product.variantCount > 1 && (
            <ScrollReveal animation="slide-right" className="inline-flex items-center gap-1 rounded-sm p-2 bg-muted/60 border border-border/40 mb-6 w-full">
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
                {Boolean(product.ratingsQuantity) && (
                  <span className="ms-1 text-xs opacity-70">
                    ({product.ratingsQuantity})
                  </span>
                )}
              </button>
            </ScrollReveal>
          )}

          {activeTab === "order" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-muted/60 p-5">
              <ProductVariantSelector
                attributeGroups={attributeGroups}
                activeAttributes={activeAttributes}
                onSelectAttribute={handleAttributeSelect}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                unitText={unitText}
                isUnlimitedStock={product.isUnlimitedStock}
                currentStock={currentStock}
              />

              <ProductOrderCard
                selectedVariant={selectedVariant}
                displayPrice={displayPrice}
                quantity={quantity}
                unitText={unitText}
                canOrder={canOrder}
                isAddingToCart={isAddingToCart}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                getAttributeLabel={(key) => getAttributeLabel(key, isAr)}
              />
            </div>
          ) : (
            <ProductReviewsTab
              ratingsAverage={product.ratingsAverage}
              ratingsQuantity={product.ratingsQuantity}
            />
          )}
        </div>

        {/* Similar Products */}
        <SimilarProducts product={product} />

        {/* Image Lightbox Modal */}
        <ProductLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={title}
          imageSrc={currentDisplayImage}
        />
      </div>
    </div>
  );
}
