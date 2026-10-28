import { getSalesBreakdown, getRecentCustomers } from "@/lib/admin-data";
import {
  TopProductsPanel,
  CategorySalesPanel,
  RecentCustomersPanel,
} from "@/components/admin/dashboard-insights";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Insights" };

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await requireAdmin(); // layouts don't re-run on client navigation
  const [breakdown, recent] = await Promise.all([getSalesBreakdown(), getRecentCustomers(6)]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-ink">Insights</h1>
      <p className="mt-1 text-sm text-muted">
        Best sellers, category mix and your newest customers.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TopProductsPanel products={breakdown.topProducts} />
        <CategorySalesPanel categories={breakdown.categories} />
      </div>

      <div className="mt-6">
        <RecentCustomersPanel customers={recent.customers} />
      </div>
    </div>
  );
}
