import { Suspense } from "react";
import type { ProductView } from "@/lib/types";
import { ProductGrid } from "@/components/product-grid";
import { ShopFilters } from "./shop-filters";

type Props = {
  eyebrow: string;
  title: string;
  description?: string | null;
  products: ProductView[];
  materials: string[];
};

export function ShopBrowser({ eyebrow, title, description, products, materials }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <header className="border-b border-[var(--line)] pb-8">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <Suspense fallback={<div className="text-sm text-muted">Loading filters…</div>}>
          <ShopFilters materials={materials} />
        </Suspense>

        <div>
          <p className="mb-5 text-sm text-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
