"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/components/ui/toast";
import { formatPrice, savingsOf } from "@/lib/format";
import { SavingsStrip } from "@/components/ui/sale-badge";
import { shippingFor } from "@/lib/settings-shared";

type PaymentMethod = "COD" | "PAYFAST" | "SAFEPAY";

export type CheckoutDefaults = {
  name?: string;
  email?: string;
  phone?: string;
};

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.22)]";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted";

const NOTICES = {
  cancelled: "Payment was cancelled. You can try again below.",
  failed: "Payment failed. Please try again or choose Cash on Delivery.",
} as const;

export function CheckoutForm({
  defaults,
  paymentNotice = null,
  gateways = { PAYFAST: false, SAFEPAY: false },
  buyNow = null,
  shippingRules = { flatFee: 500, freeThreshold: 50000, deliveryTime: "" },
}: {
  shippingRules?: { flatFee: number; freeThreshold: number; deliveryTime: string };
  buyNow?: CartItem | null;
  defaults?: CheckoutDefaults;
  paymentNotice?: keyof typeof NOTICES | null;
  gateways?: { PAYFAST: boolean; SAFEPAY: boolean };
}) {
  const router = useRouter();
  const cart = useCart();
  // Single-item "Buy it now" checkout, otherwise the whole cart.
  const items = buyNow ? [buyNow] : cart.items;
  const subtotal = buyNow ? buyNow.price * buyNow.quantity : cart.subtotal;
  const savings = buyNow
    ? (savingsOf(buyNow.price, buyNow.compareAtPrice) ?? 0) * buyNow.quantity
    : cart.savings;
  const ready = buyNow ? true : cart.ready;
  const toast = useToast();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(paymentNotice ? NOTICES[paymentNotice] : null);


  const shipping = shippingFor(subtotal, shippingRules);
  const total = subtotal + shipping;

  const paymentNoticeShown = useRef(false);
  useEffect(() => {
    if (!paymentNotice || paymentNoticeShown.current) return; // guard StrictMode double-invoke
    paymentNoticeShown.current = true;
    toast.error(NOTICES[paymentNotice]);
  }, [paymentNotice, toast]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12" aria-busy="true">
        <h1 className="font-serif text-4xl font-semibold text-ink">Checkout</h1>
        <div className="mt-8 h-96 animate-pulse rounded-2xl bg-cream-soft" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">Your cart is empty</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3 text-sm font-medium text-maroon"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      email: form.get("email"),
      phone: form.get("phone"),
      address: form.get("address"),
      city: form.get("city"),
      postalCode: form.get("postalCode"),
      notes: form.get("notes"),
      paymentMethod: payment,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401 && data.signIn) {
        // Session ended while on this page — sign in again and come back.
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not place your order. Please try again.");
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message, { title: "Order not placed" });
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-4xl font-semibold text-ink">Checkout</h1>
      {defaults?.email && (
        <p className="mt-2 text-sm text-muted">
          Signed in as <span className="text-ink">{defaults.email}</span> — this order will be
          saved to your account.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_390px] lg:gap-12">
        {/* Details */}
        <div className="space-y-8">
          <Section step={1} title="Contact & Delivery">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-customerName" className={labelCls}>Full name</label>
                <input name="customerName" id="co-customerName" required defaultValue={defaults?.name} className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-email" className={labelCls}>Email</label>
                <input name="email" id="co-email" type="email" required readOnly defaultValue={defaults?.email} title="Order updates go to your account email" className={`${inputCls} cursor-not-allowed opacity-75`} />
              </div>
              <div>
                <label htmlFor="co-phone" className={labelCls}>Phone</label>
                <input name="phone" id="co-phone" type="tel" required defaultValue={defaults?.phone} placeholder="03xx xxxxxxx" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className={labelCls}>Delivery address</label>
                <input name="address" id="co-address" required placeholder="House #, street, area" className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-city" className={labelCls}>City</label>
                <input name="city" id="co-city" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-postalCode" className={labelCls}>Postal code (optional)</label>
                <input name="postalCode" id="co-postalCode" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-notes" className={labelCls}>Order notes (optional)</label>
                <textarea name="notes" id="co-notes" rows={3} className={inputCls} />
              </div>
            </div>
          </Section>

          <Section step={2} title="Payment" hint="All transactions are secure and encrypted.">
            <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
              <PaymentOption
                value="COD"
                current={payment}
                onSelect={setPayment}
                title="Cash on Delivery (COD)"
                desc="Shop now & pay in cash at your doorstep."
                last={!gateways.PAYFAST && !gateways.SAFEPAY}
              />
              {gateways.PAYFAST && (
                <PaymentOption
                  value="PAYFAST"
                  current={payment}
                  onSelect={setPayment}
                  title="Credit / Debit Card"
                  desc="Pay securely online via PayFast."
                  icons={<CardBrands />}
                  last={!gateways.SAFEPAY}
                />
              )}
              {gateways.SAFEPAY && (
                <PaymentOption
                  value="SAFEPAY"
                  current={payment}
                  onSelect={setPayment}
                  title="Card / Wallet (Safepay)"
                  desc="Pay securely online via Safepay."
                  icons={<CardBrands />}
                  last
                />
              )}
            </div>
          </Section>

        </div>

        {/* Order summary — sticky/locked on desktop */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--line-strong)] bg-surface/80 p-6 shadow-[0_24px_60px_-40px_rgba(38,8,16,0.5)]">
            <h2 className="font-serif text-xl font-semibold text-ink">Order Summary</h2>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto border-b border-[var(--line)] pb-5 pr-1 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-[var(--line)] bg-sand">
                      <ProductImage src={i.image} alt={i.name} seed={i.slug} />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[0.62rem] font-semibold text-light">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{i.name}</p>
                    {i.material && <p className="truncate text-xs text-muted">{i.material}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-ink">{formatPrice(i.price * i.quantity)}</span>
                    {i.compareAtPrice && savingsOf(i.price, i.compareAtPrice) && (
                      <p className="text-xs text-muted line-through">{formatPrice(i.compareAtPrice * i.quantity)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-ink">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted">Free shipping over {formatPrice(shippingRules.freeThreshold)}.</p>
              )}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-[var(--line)] pt-4">
              <span className="font-medium text-ink">Total</span>
              <span className="font-serif text-2xl font-semibold text-ink">{formatPrice(total)}</span>
            </div>
            {savings > 0 && <SavingsStrip amount={savings} className="mt-4" />}

            {error && (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 block w-full rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.1em] text-maroon transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Complete Order"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <LockIcon /> Secure &amp; encrypted checkout · ZARIERA
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-light">
          {step}
        </span>
        <div>
          <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PaymentOption({
  value,
  current,
  onSelect,
  title,
  desc,
  icons,
  last = false,
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  onSelect: (v: PaymentMethod) => void;
  title: string;
  desc: string;
  icons?: ReactNode;
  last?: boolean;
}) {
  const active = current === value;
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 p-4 transition ${
        last ? "" : "border-b border-[var(--line)]"
      } ${active ? "bg-gold/8" : "hover:bg-black/[0.02]"}`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="h-4 w-4 accent-[var(--color-gold-deep)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        <span className={`block text-sm text-muted transition-all ${active ? "max-h-10 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
          {desc}
        </span>
      </span>
      {icons}
    </label>
  );
}

function CardBrands() {
  const chip = "rounded bg-white px-1.5 py-0.5 text-[0.55rem] font-bold leading-none ring-1 ring-black/10";
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className={`${chip} text-[#1a1f71]`}>VISA</span>
      <span className={`${chip} text-[#eb001b]`}>MC</span>
      <span className={`${chip} text-[#006fcf]`}>AMEX</span>
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}
