import Link from "next/link";
import { getAdminOrders } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { DbBanner } from "@/components/admin/db-banner";
import { StatusBadge } from "@/components/admin/status-badge";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminOrdersPage() {
  const { dbConnected, orders } = await getAdminOrders();

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-ink">Orders</h1>

      <div className="mt-6">
        {!dbConnected && <DbBanner />}

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-cream-soft py-16 text-center">
            <p className="font-serif text-xl text-ink">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              {dbConnected
                ? "Orders placed in the store will appear here."
                : "Connect the database to see real orders. (Preview checkout simulates orders without saving.)"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-cream-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--line)] last:border-0 hover:bg-cream">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-medium text-gold-deep hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">{o.customerName}</td>
                    <td className="px-4 py-3 text-muted">{o.itemCount}</td>
                    <td className="px-4 py-3 text-ink">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{o.paymentMethod}</span>{" "}
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
