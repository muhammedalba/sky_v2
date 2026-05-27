export const attributeTranslations: Record<string, { ar: string; en: string }> = {
  color: { ar: "اللون", en: "Color" },
  اللون: { ar: "اللون", en: "Color" },
  size: { ar: "المقاس", en: "Size" },
  المقاس: { ar: "المقاس", en: "Size" },
  الحجم: { ar: "المقاس", en: "Size" },
  weight: { ar: "الوزن", en: "Weight" },
  الوزن: { ar: "الوزن", en: "Weight" },
  material: { ar: "المادة", en: "Material" },
  المادة: { ar: "المادة", en: "Material" },
  storage: { ar: "السعة", en: "Storage" },
  السعة: { ar: "السعة", en: "Storage" },
  memory: { ar: "الذاكرة", en: "Memory" },
  الذاكرة: { ar: "الذاكرة", en: "Memory" },
};

export const getAttributeLabel = (key: string, isAr: boolean) => {
  const normKey = key.trim().toLowerCase();
  const entry = attributeTranslations[normKey];
  if (entry) return isAr ? entry.ar : entry.en;
  return isAr ? key : key.charAt(0).toUpperCase() + key.slice(1);
};

export type CartVariant = {
  _id?: string;
  price?: number;
  priceAfterDiscount?: number;
  stock?: number;
  sku?: string;
  attributes?: Record<string, { value: string | number; unit?: string }>;
  image?: string;
};

export type CartProduct = {
  _id: string;
  slug?: string;
  title: string | Record<string, string>;
  imageCover?: string;
  isActive?: boolean;
  isUnlimitedStock?: boolean;
  category?: { name: string | Record<string, string> };
  variants?: CartVariant[];
  priceRange?: { min: number };
  comparePrice?: number;
};

export type CartItem = {
  productId?: string;
  variantId?: string;
  quantity: number;
  price?: number;
  product: CartProduct;
  variant?: CartVariant;
};

export const resolveItemData = (item: CartItem | any) => {
  // Server cart returns item.variant as a populated object
  const populatedVariant: CartVariant | null =
    item.variant && typeof item.variant === "object" ? item.variant : null;

  const guestVariant = item.product?.variants?.find(
    (v: any) => v._id === item.variantId,
  );

  const price =
    item.price ??
    populatedVariant?.price ??
    populatedVariant?.priceAfterDiscount ??
    guestVariant?.priceAfterDiscount ??
    guestVariant?.price ??
    item.product?.priceRange?.min ??
    0;

  const stock = populatedVariant?.stock ?? guestVariant?.stock ?? null;
  const sku = populatedVariant?.sku ?? guestVariant?.sku ?? null;
  const attributes =
    populatedVariant?.attributes ?? guestVariant?.attributes ?? null;
  const image = populatedVariant?.image ?? item.product?.imageCover ?? "";
  const isUnlimitedStock: boolean = item.product?.isUnlimitedStock ?? false;
  const isActive: boolean = item.product?.isActive ?? true;

  return { price, stock, sku, attributes, image, isUnlimitedStock, isActive };
};
