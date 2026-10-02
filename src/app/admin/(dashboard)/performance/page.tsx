import { getStorePerformance, getOrderStatusBreakdown } from "@/lib/admin-data";
import { PerformanceRings } from "@/components/admin/performance-rings";
import { OrderPipelineDonut } from "@/components/admin/order-pipeline-donut";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const [performance, statusBreakdown] = await Promise.all([
    getStorePerformance(),
    getOrderStatusBreakdown(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-ink">Performance</h1>
      <p className="mt-1 text-sm text-muted">
        Store health and your order-fulfilment pipeline at a glance.
      </p>

      <div className="mt-6">
        <PerformanceRings data={performance} />
      </div>
      <div className="mt-6">
        <OrderPipelineDonut counts={statusBreakdown.counts} total={statusBreakdown.total} />
      </div>
    </div>
  );
}
