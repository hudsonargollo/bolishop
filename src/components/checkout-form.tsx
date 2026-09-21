"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";
import { shippingFor, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

type PaymentMethod = "COD" | "PAYFAST" | "SAFEPAY";

export type CheckoutDefaults = {
  name?: string;
  email?: string;
  phone?: string;
};

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.22)]";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted";

export function CheckoutForm({ defaults }: { defaults?: CheckoutDefaults }) {
  const router = useRouter();
  const { items, subtotal, ready } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guests (not signed in) can create an account while placing their order.
  const isGuest = !defaults?.email;
  const [createAccount, setCreateAccount] = useState(false);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "cancelled") setError("Payment was cancelled. You can try again below.");
    else if (p === "failed") setError("Payment failed. Please try again or choose Cash on Delivery.");
  }, []);

  if (ready && items.length === 0) {
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
      createAccount: isGuest && createAccount,
      password: isGuest && createAccount ? form.get("password") : undefined,
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
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not place your order. Please try again.");
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderNumber)}&total=${data.total}${
          data.accountCreated ? "&account=1" : ""
        }`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
                <label className={labelCls}>Full name</label>
                <input name="customerName" required defaultValue={defaults?.name} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" required defaultValue={defaults?.email} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" type="tel" required defaultValue={defaults?.phone} placeholder="03xx xxxxxxx" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Delivery address</label>
                <input name="address" required placeholder="House #, street, area" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input name="city" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Postal code (optional)</label>
                <input name="postalCode" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Order notes (optional)</label>
                <textarea name="notes" rows={3} className={inputCls} />
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
              />
              <PaymentOption
                value="PAYFAST"
                current={payment}
                onSelect={setPayment}
                title="Credit / Debit Card"
                desc="Pay securely online via PayFast."
                icons={<CardBrands />}
              />
              <PaymentOption
                value="SAFEPAY"
                current={payment}
                onSelect={setPayment}
                title="Card / Wallet (Safepay)"
                desc="Pay securely online via Safepay."
                icons={<CardBrands />}
                last
              />
            </div>
          </Section>

          {/* First-order sign-up (guests only) */}
          {isGuest && (
            <section className="rounded-xl border border-[var(--line)] bg-gold/5 p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-1 accent-[var(--color-gold-deep)]"
                />
                <span>
                  <span className="block font-medium text-ink">Create an account for faster checkout</span>
                  <span className="block text-sm text-muted">
                    Save your details and track this &amp; future orders. We&apos;ll use your email above.
                  </span>
                </span>
              </label>
              {createAccount && (
                <div className="mt-4">
                  <label className={labelCls}>Choose a password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className={`${inputCls} max-w-sm`}
                  />
                  <p className="mt-2 text-xs text-muted">
                    Already have an account?{" "}
                    <Link href="/login" className="text-gold-deep underline">
                      Sign in
                    </Link>{" "}
                    instead.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Order summary — sticky/locked on desktop */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--line-strong)] bg-white/80 p-6 shadow-[0_24px_60px_-40px_rgba(38,8,16,0.5)]">
            <h2 className="font-serif text-xl font-semibold text-ink">Order Summary</h2>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto border-b border-[var(--line)] pb-5 pr-1 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-[var(--line)] bg-sand">
                      <ProductImage src={i.image} alt={i.name} seed={i.slug} />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-[0.62rem] font-semibold text-cream">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{i.name}</p>
                    {i.material && <p className="truncate text-xs text-muted">{i.material}</p>}
                  </div>
                  <span className="shrink-0 text-ink">{formatPrice(i.price * i.quantity)}</span>
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
                <p className="text-xs text-muted">Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
              )}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-[var(--line)] pt-4">
              <span className="font-medium text-ink">Total</span>
              <span className="font-serif text-2xl font-semibold text-ink">{formatPrice(total)}</span>
            </div>

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
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-cream">
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
