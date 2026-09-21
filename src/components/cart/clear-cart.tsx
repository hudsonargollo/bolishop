"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

// Clears the cart once, on mount — rendered on the order-confirmation page.
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
