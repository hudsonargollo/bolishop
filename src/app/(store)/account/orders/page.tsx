import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";
import { StatusBadge } from "@/components/admin/status-badge";
import { lookupOrder } from "@/lib/order-lookup";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Status",
  description: "Track your ZARIERA order — enter your order number and email.",
};

export default async function OrderStatusPage({
  searchParams,
}: PageProps<"/account/orders">) {
  const sp = await searchParams;
  const orderNumber = (Array.isArray(sp.order) ? sp.order[0] : sp.order)?.trim() ?? "";
  const email = (Array.isArray(sp.email) ? sp.email[0] : sp.email)?.trim() ?? "";

  const result = orderNumber && email ? await lookupOrder(orderNumber, email) : null;

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

      <form action="/account/orders" method="get" className="mx-auto mt-10 max-w-md space-y-4">
        <input
          name="order"
          defaultValue={orderNumber}
          required
          placeholder="Order number (e.g. ZR-XXXXXX-XXX)"
          className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <input
          name="email"
          type="email"
          defaultValue={email}
          required
          placeholder="Email used at checkout"
          className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-maroon px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2"
        >
          Track Order
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-10">
          {result.ok ? (
            <div className="rounded-xl border border-[var(--line)] bg-cream-soft p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-xl font-semibold text-ink">
                    {result.order.orderNumber}
                  </p>
                  <p className="text-sm text-muted">
                    Placed {new Date(result.order.createdAt).toLocaleDateString("en-PK")}
                  </p>
                </div>
                <StatusBadge status={result.order.status} />
              </div>

              <ul className="mt-5 space-y-2 border-y border-[var(--line)] py-4 text-sm">
                {result.order.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="text-ink">
                      {i.name} <span className="text-muted">× {i.quantity}</span>
                    </span>
                    <span className="text-ink">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted">
                  Payment: {result.order.paymentMethod} · {result.order.paymentStatus}
                </span>
                <span className="font-medium text-ink">{formatPrice(result.order.total)}</span>
              </div>
            </div>
          ) : (
            <p className="rounded-md bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
              {result.reason === "db-down"
                ? "Order tracking is not available right now. Please try again later or contact us."
                : "No order found with that number and email. Please check and try again."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
