import { Order } from "@/features/orders/types";

/**
 * Per order line, how many were returned (credited, or being credited): the
 * purchased quantity less what the server says is left to return
 * (`returnPolicy.remaining`, sent with the customer's order). Zero for every
 * line when the server sent none (no invoice issued yet: nothing returned).
 */
export function returnedQuantities(order: Order): number[] {
  const remaining = order.returnPolicy?.remaining;
  return order.items.map((item, i) =>
    remaining && remaining[i] !== undefined
      ? Math.max(0, item.quantity - remaining[i])
      : 0,
  );
}
