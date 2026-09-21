"use client";

import { useState } from "react";
import { useCart } from "./cart/cart-provider";
import type { ProductView } from "@/lib/types";

// Compact "Add to cart" button used on product cards.
export function QuickAdd({ product }: { product: ProductView }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  if (soldOut) {
    return (
      <span className="mt-3 block w-full cursor-not-allowed rounded-full border border-[var(--line)] py-2 text-center text-xs uppercase tracking-[0.12em] text-muted">
        Sold out
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0],
            material: product.material,
            stock: product.stock,
          },
          1
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="mt-3 block w-full rounded-full border border-maroon bg-transparent py-2 text-center text-xs font-medium uppercase tracking-[0.12em] text-maroon transition hover:bg-maroon hover:text-cream"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
