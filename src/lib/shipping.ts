// Client-safe shipping policy (no server-only imports).
// Free shipping over the threshold, otherwise a flat fee (PKR).
export const FREE_SHIPPING_THRESHOLD = 50000;
export const FLAT_SHIPPING = 500;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}
