import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateOrderStatus, updatePaymentStatus } from "../actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted hover:text-ink">
        ← Back to orders
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold text-ink">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        Placed {new Date(order.createdAt).toLocaleString("en-PK")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items + totals */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-cream-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3 text-ink">{i.name}</td>
                    <td className="px-4 py-3 text-muted">{formatPrice(i.price)}</td>
                    <td className="px-4 py-3 text-muted">{i.quantity}</td>
                    <td className="px-4 py-3 text-right text-ink">
                      {formatPrice(i.price * i.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-[var(--line)] px-4 py-4 text-sm">
              <Line label="Subtotal" value={formatPrice(order.subtotal)} />
              <Line label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
              <div className="flex justify-between border-t border-[var(--line)] pt-2 font-medium text-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-[var(--line)] bg-cream-soft p-5 text-sm">
            <h2 className="mb-3 font-serif text-lg font-semibold text-ink">Customer</h2>
            <dl className="space-y-1.5">
              <Info label="Name" value={order.customerName} />
              <Info label="Email" value={order.email} />
              <Info label="Phone" value={order.phone} />
              <Info label="Address" value={`${order.address}, ${order.city}${order.postalCode ? ` ${order.postalCode}` : ""}`} />
              {order.notes && <Info label="Notes" value={order.notes} />}
            </dl>
          </div>
        </div>

        {/* Status controls */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-[var(--line)] bg-cream-soft p-5">
            <h2 className="mb-3 font-serif text-lg font-semibold text-ink">Order status</h2>
            <form action={updateOrderStatus.bind(null, order.id)} className="flex gap-2">
              <select name="status" defaultValue={order.status} className={select}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button className={saveBtn}>Save</button>
            </form>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-cream-soft p-5">
            <h2 className="mb-1 font-serif text-lg font-semibold text-ink">Payment</h2>
            <p className="mb-3 text-sm text-muted">Method: {order.paymentMethod}</p>
            <form action={updatePaymentStatus.bind(null, order.id)} className="flex gap-2">
              <select name="paymentStatus" defaultValue={order.paymentStatus} className={select}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button className={saveBtn}>Save</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

const select =
  "w-full rounded-md border border-[var(--line-strong)] bg-cream px-3 py-2 text-sm outline-none focus:border-gold";
const saveBtn =
  "rounded-md bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-2";

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
