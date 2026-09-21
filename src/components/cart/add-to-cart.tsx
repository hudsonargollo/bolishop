"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart-provider";

export function AddToCart({ product }: { product: Omit<CartItem, "quantity"> }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (soldOut) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full border border-[var(--line)] px-8 py-3.5 text-sm font-medium tracking-wide text-muted"
      >
        Sold out
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center rounded-full border border-[var(--line-strong)]">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-4 py-3 text-lg text-ink transition hover:text-gold-deep"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="px-4 py-3 text-lg text-ink transition hover:text-gold-deep"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3.5 text-sm font-medium tracking-wide text-maroon transition hover:opacity-90"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
