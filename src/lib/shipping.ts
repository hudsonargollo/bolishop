import { formatPrice } from "./format";

// Client-safe shipping policy (no server-only imports).
// Free shipping over the threshold, otherwise a flat fee (PKR).
// Override via NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD / NEXT_PUBLIC_FLAT_SHIPPING
// (confirm the threshold with the client — Rs 50,000 is high for this range).
function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const FREE_SHIPPING_THRESHOLD = num(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD, 50000);
export const FLAT_SHIPPING = num(process.env.NEXT_PUBLIC_FLAT_SHIPPING, 500);

/** Delivery promise shown across the site (product page, FAQ, shipping, chat). */
export const DELIVERY_TIME = "3–5 working days";

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export const FREE_SHIPPING_TEXT = `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`;
