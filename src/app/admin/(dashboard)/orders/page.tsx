import { getAdminOrders } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { DbBanner } from "@/components/admin/db-banner";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { dbConnected, orders } = await getAdminOrders();

  const revenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Orders</h1>
          <p className="mt-1 text-sm text-muted">Track, review and update customer orders.</p>
        </div>
      </div>

      <div className="mt-6">
        {!dbConnected && <DbBanner />}

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-surface py-16 text-center">
            <p className="font-serif text-xl text-ink">No orders yet</p>
            <p className="mt-1 text-sm text-muted">
              {dbConnected
                ? "Orders placed in the store will appear here."
                : "Connect the database to see real orders."}
            </p>
          </div>
        ) : (
          <>
            {/* Quick stats */}
            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              <MiniStat label="Total orders" value={String(orders.length)} />
              <MiniStat label="Pending" value={String(pending)} accent />
              <MiniStat label="Revenue" value={formatPrice(revenue)} />
            </div>

            <OrdersTable orders={orders} />
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(38,8,16,0.4)]">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-1.5 font-serif text-2xl font-bold ${accent ? "text-gold-deep" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
