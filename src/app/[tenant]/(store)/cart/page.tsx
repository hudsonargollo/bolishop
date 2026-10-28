"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import { LinePrice, SavingsStrip } from "@/components/ui/sale-badge";

export default function CartPage() {
  const { items, subtotal, savings, setQuantity, remove, count, ready } = useCart();
  const toast = useToast();

  function handleRemove(id: string, name: string) {
    remove(id);
    toast.info(`${name} removed from your bag`);
  }

  // Cart lives in localStorage — avoid flashing an empty "Rs 0" bag before it loads.
  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-14" aria-busy="true">
        <h1 className="font-serif text-4xl font-semibold text-ink">Shopping Bag</h1>
        <div className="mt-10 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-cream-soft" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-serif text-4xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mt-3 text-muted">Discover something you&apos;ll treasure.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3 text-sm font-medium text-maroon transition hover:opacity-90"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="font-serif text-4xl font-semibold text-ink">
        Shopping Bag{ready && count > 0 ? ` (${count})` : ""}
      </h1>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link
                href={`/product/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-sand"
              >
                <ProductImage src={item.image} alt={item.name} seed={item.slug} />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-serif text-lg text-ink hover:text-gold-deep"
                    >
                      {item.name}
                    </Link>
                    {item.material && (
                      <p className="text-sm text-muted">{item.material}</p>
                    )}
                  </div>
                  <LinePrice price={item.price} compareAt={item.compareAtPrice} quantity={item.quantity} />
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-[var(--line-strong)]">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-ink transition hover:text-gold-deep"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-ink transition hover:text-gold-deep"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="text-sm text-muted underline-offset-4 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary — locked in place while items scroll */}
        <aside className="rounded-xl border border-[var(--line)] bg-surface/70 p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-serif text-xl font-semibold text-ink">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="text-ink">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-5 flex justify-between border-t border-[var(--line)] pt-5">
            <span className="font-medium text-ink">Total</span>
            <span className="font-serif text-xl font-semibold text-ink">
              {formatPrice(subtotal)}
            </span>
          </div>
          {savings > 0 && <SavingsStrip amount={savings} className="mt-5" />}
          {/* Guests are sent to sign in first (checkout needs an account), then back. */}
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3.5 text-center text-sm font-medium text-maroon transition hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-gold-deep hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
