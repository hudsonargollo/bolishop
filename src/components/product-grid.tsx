import type { ProductView } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: ProductView[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-white/50 py-20 text-center">
        <p className="font-serif text-xl text-ink">No pieces found</p>
        <p className="mt-1 text-sm text-muted">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
