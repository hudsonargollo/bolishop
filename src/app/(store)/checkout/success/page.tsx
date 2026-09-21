import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ClearCart } from "@/components/cart/clear-cart";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const order = (Array.isArray(sp.order) ? sp.order[0] : sp.order) ?? null;
  const totalRaw = Array.isArray(sp.total) ? sp.total[0] : sp.total;
  const total = totalRaw ? Number(totalRaw) : null;
  const accountCreated = (Array.isArray(sp.account) ? sp.account[0] : sp.account) === "1";

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <ClearCart />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gold-hi to-gold">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#260810" strokeWidth="2.6">
          <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-8 font-serif text-4xl font-semibold text-ink">Thank you!</h1>
      <p className="mt-3 text-muted">
        Your order has been placed. A confirmation will be sent to your email.
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-xl border border-[var(--line)] bg-white/70 p-6 text-sm">
        {order && (
          <div className="flex justify-between">
            <span className="text-muted">Order number</span>
            <span className="font-medium text-ink">{order}</span>
          </div>
        )}
        {total != null && (
          <div className="mt-3 flex justify-between">
            <span className="text-muted">Total</span>
            <span className="font-medium text-ink">{formatPrice(total)}</span>
          </div>
        )}
      </div>

      {accountCreated && (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gold/40 bg-gold/5 p-5 text-sm">
          <p className="font-medium text-ink">Your account is ready 🎉</p>
          <p className="mt-1 text-muted">
            You&apos;re now signed in. View this order and track future ones from your account.
          </p>
          <Link
            href="/account"
            className="mt-3 inline-block rounded-full border border-[var(--line-strong)] px-6 py-2 text-xs font-medium uppercase tracking-[0.12em] text-ink transition hover:border-gold hover:text-gold-deep"
          >
            Go to my account
          </Link>
        </div>
      )}

      <p className="mx-auto mt-6 max-w-md text-sm text-muted">
        For Cash on Delivery, please keep the amount ready at delivery. Our team will call
        to confirm your order.
      </p>

      <Link
        href="/shop"
        className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3 text-sm font-medium text-maroon transition hover:opacity-90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
