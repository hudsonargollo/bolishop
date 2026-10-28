import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";
import { OrderLookup } from "@/components/order-lookup";

export const metadata: Metadata = {
  title: "Order Status",
  description: "Track your ZARIERA order — enter your order number and email.",
  alternates: { canonical: "/account/orders" },
};

export default async function OrderStatusPage({
  searchParams,
}: PageProps<"/account/orders">) {
  const sp = await searchParams;
  // Only the order number may be pre-filled from a link — never the email.
  const orderNumber = (Array.isArray(sp.order) ? sp.order[0] : sp.order)?.trim() ?? "";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-3 block">Help</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Order Status</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Enter your order number and the email you used at checkout to track your order.
        </p>
      </div>

      <OrderLookup defaultOrder={orderNumber} />
    </div>
  );
}
