import { Suspense } from "react";
import type { ProductView, ShopFacets } from "@/lib/types";
import { ProductGrid } from "@/components/product-grid";
import { ShopFilters } from "./shop-filters";
import { ShopToolbar } from "./shop-toolbar";

type Props = {
  eyebrow: string;
  title: string;
  description?: string | null;
  products: ProductView[];
  facets: ShopFacets;
};

export function ShopBrowser({ eyebrow, title, description, products, facets }: Props) {
  const countLine = (
    <p className="mb-5 border-b border-[var(--line)] pb-4 text-sm text-muted">
      {products.length} {products.length === 1 ? "piece" : "pieces"}
    </p>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <header className="border-b border-[var(--line)] pb-8">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[250px_1fr] xl:gap-10">
        {/* Desktop sidebar (mobile uses the drawer in ShopToolbar) */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-[var(--line)] bg-surface/60 p-5 shadow-[0_24px_50px_-40px_rgba(38,8,16,0.5)]">
            <p className="mb-5 font-serif text-xl font-semibold text-ink">Refine</p>
            <Suspense fallback={<div className="text-sm text-muted">Loading filters…</div>}>
              <ShopFilters facets={facets} />
            </Suspense>
          </div>
        </aside>

        <div>
          <Suspense fallback={countLine}>
            <ShopToolbar count={products.length} facets={facets} />
          </Suspense>
          <ProductGrid products={products} layout="sidebar" />
        </div>
      </div>
    </div>
  );
}
