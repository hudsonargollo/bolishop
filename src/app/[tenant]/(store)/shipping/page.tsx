import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { formatPrice } from "@/lib/format";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/shipping" },
  title: "Shipping & Returns",
  description: "ZARIERA shipping options, delivery times, and our returns policy.",
};

export default async function ShippingPage() {
  const { flatFee: FLAT_SHIPPING, freeThreshold: FREE_SHIPPING_THRESHOLD, deliveryTime: DELIVERY_TIME } = (
    await getStoreSettings()
  ).shipping;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-3 block">Help</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Shipping &amp; Returns</h1>
      </div>

      <div className="mt-12 space-y-10">
        <section>
          <h2 className="font-serif text-2xl font-semibold text-ink">Shipping</h2>
          <ul className="mt-4 space-y-3 text-ink/80">
            <li>• Nationwide delivery across Pakistan, typically <strong>{DELIVERY_TIME}</strong>.</li>
            <li>• Flat shipping of <strong>{formatPrice(FLAT_SHIPPING)}</strong> — <strong>free</strong> on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}.</li>
            <li>• Every order is carefully packaged in ZARIERA signature packaging.</li>
            <li>• You&apos;ll receive an order confirmation, and our team may call to confirm delivery details.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-ink">Returns &amp; Exchanges</h2>
          <ul className="mt-4 space-y-3 text-ink/80">
            <li>• Returns accepted within <strong>7 days</strong> of delivery for unworn items in original condition and packaging.</li>
            <li>• Exchanges are subject to availability. Contact us to arrange one.</li>
            <li>• Custom or personalized pieces are non-returnable unless faulty.</li>
            <li>• Refunds are processed to the original payment method after inspection.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--line)] bg-cream-soft p-6 text-sm text-muted">
          Need help with a return? Reach us via the{" "}
          <Link href="/contact" className="text-gold-deep hover:underline">
            contact page
          </Link>{" "}
          and quote your order number.
        </section>
      </div>
    </div>
  );
}
