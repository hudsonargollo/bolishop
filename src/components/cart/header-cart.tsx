"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function HeaderCart() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart${ready && count ? `, ${count} items` : ""}`}
      className="relative transition-colors hover:text-gold"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
        <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-gold-hi to-gold px-1 text-[0.6rem] font-semibold text-maroon">
          {count}
        </span>
      )}
    </Link>
  );
}
