import Link from "next/link";
import { getAdminStats, getAdminOrders } from "@/lib/admin-data";
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

export default async function AdminDashboard() {
  const [stats, ordersData] = await Promise.all([getAdminStats(), getAdminOrders()]);
  const recentOrders = ordersData.orders.slice(0, 5);

  const cards = [
    { label: "Revenue", value: formatPrice(stats.revenue), icon: <CoinIcon />, hint: "Confirmed orders" },
    { label: "Orders", value: String(stats.orders), icon: <BagIcon />, hint: "All time" },
    { label: "Pending", value: String(stats.pendingOrders), icon: <ClockIcon />, hint: "Awaiting action" },
    { label: "Products", value: String(stats.products), icon: <TagIcon />, hint: "In catalog" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Welcome back to ZARIERA management.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-2"
          >
            + Add product
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--line-strong)] px-5 py-2.5 text-sm text-ink transition hover:border-gold hover:text-gold-deep"
          >
            View store
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {!stats.dbConnected && <DbBanner />}

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(38,8,16,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-26px_rgba(38,8,16,0.55)]"
            >
              {/* gold top accent */}
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-hi via-gold to-gold-deep" />
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-maroon to-wine-deep text-gold shadow-inner">
                  {c.icon}
                </span>
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-muted">
                  {c.label}
                </span>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-ink">{c.value}</p>
              <p className="mt-1 text-xs text-muted">{c.hint}</p>
            </div>
          ))}
        </div>

        {/* Recent orders + quick actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Recent orders */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_-22px_rgba(38,8,16,0.4)]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-ink">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm text-gold-deep hover:underline">
                View all →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-[var(--line)] py-10 text-center text-sm text-muted">
                {stats.dbConnected
                  ? "No orders yet. Orders will appear here as they come in."
                  : "Connect the database to see orders."}
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-[var(--line)] transition-colors last:border-0 hover:bg-cream-soft">
                        <td className="py-3 pr-3">
                          <Link href={`/admin/orders/${o.id}`} className="font-medium text-gold-deep hover:underline">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-3 text-ink">{o.customerName}</td>
                        <td className="py-3 pr-3 text-ink">{formatPrice(o.total)}</td>
                        <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
                        <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick actions */}
          <aside className="space-y-3">
            <h2 className="eyebrow mb-1">Quick actions</h2>
            <QuickAction href="/admin/products/new" title="Add a product" desc="Create a new listing" icon={<TagIcon />} />
            <QuickAction href="/admin/products" title="Manage products" desc="Edit or remove items" icon={<BagIcon />} />
            <QuickAction href="/admin/orders" title="Manage orders" desc="Update order status" icon={<ClockIcon />} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-4 shadow-[0_10px_30px_-24px_rgba(38,8,16,0.4)] transition hover:border-gold hover:shadow-[0_16px_36px_-26px_rgba(38,8,16,0.5)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon/8 text-gold-deep transition group-hover:bg-maroon group-hover:text-gold">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <span className="text-gold-deep transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

/* icons */
function CoinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 4h7l9 9-7 7-9-9V4z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
