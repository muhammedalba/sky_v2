import { Product, ProductVariant } from "@/types";

export type CartVariant = ProductVariant;

export type CartProduct = Product;

export type CartItem = {
  productId?: string;
  variantId?: string;
  quantity: number;
  unitPrice?: number;
  product: CartProduct;
  variant?: CartVariant;
};

export const resolveItemData = (item: CartItem) => {
  // Server cart returns item.variant as a populated object
  const populatedVariant: CartVariant | null =
    item.variant && typeof item.variant === "object" ? item.variant : null;

  const guestVariant = item.product?.variants?.find(
    (v: ProductVariant) => v._id === item.variantId,
  );

  const price =item.unitPrice??
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
