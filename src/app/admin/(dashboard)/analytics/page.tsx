import { getSalesDaily, getAdminStats, getPaymentBreakdown } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { SalesChartPro } from "@/components/admin/sales-chart-pro";
import { PaymentMethodPanel, SalesHighlightsPanel } from "@/components/admin/dashboard-insights";
import { requireAdmin } from "@/lib/admin";
import { getDefaultTenantId } from "@/lib/tenant";

export const metadata = { title: "Analytics" };

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin(); // layouts don't re-run on client navigation
  const tenantId = (await getDefaultTenantId()) ?? "";
  const [salesDaily, stats, payments] = await Promise.all([
    getSalesDaily(tenantId, 365),
    getAdminStats(tenantId),
    getPaymentBreakdown(tenantId),
  ]);

  const aov = stats.orders > 0 ? Math.round(stats.revenue / stats.orders) : 0;
  const kpis = [
    { label: "Total revenue", value: formatPrice(stats.revenue), hint: "All confirmed orders" },
    { label: "Total orders", value: String(stats.orders), hint: "All time" },
    { label: "Avg. order value", value: formatPrice(aov), hint: "Revenue ÷ orders" },
    { label: "This month", value: formatPrice(stats.monthRevenue), hint: "Revenue this month" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-muted">
        Daily revenue — scroll to zoom, drag to pan, and explore any period.
      </p>

      {/* KPI summary */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-[var(--line)] bg-surface p-5 shadow-[0_10px_30px_-22px_rgba(38,8,16,0.4)]"
          >
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">{k.label}</p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink [font-variant-numeric:tabular-nums]">
              {k.value}
            </p>
            <p className="mt-1 text-xs text-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="mt-6">
        <SalesChartPro points={salesDaily.points} />
      </div>

      {/* Payment split + highlights */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PaymentMethodPanel methods={payments.methods} />
        <SalesHighlightsPanel points={salesDaily.points} />
      </div>
    </div>
  );
}
