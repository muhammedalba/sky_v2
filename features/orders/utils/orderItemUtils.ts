import type { OrderItem } from "@/features/orders/types";

/**
 * Display data for an order item. Prefers the snapshot stored on the item
 * (what was bought), falling back to the live product/variant for orders
 * created before snapshots existed.
 */
export const resolveOrderItem = (item: OrderItem) => ({
  title: item.title ?? item.productId?.title,
  image:
    item.image || item.productId?.imageCover || item.productId?.images?.[0],
  sku: item.sku || item.variantId?.sku,
  attributes: item.attributes ?? item.variantId?.attributes,
  components: item.components ?? item.variantId?.components,
  label: item.label ?? item.variantId?.label,
});
