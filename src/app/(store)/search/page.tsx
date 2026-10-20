import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 60);
  return {
    robots: { index: false, follow: true },
    title: q ? `Search: ${q}` : "Search",
    description: "Search the ZARIERA collection.",
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const products = q ? await getProducts({ q }) : [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <span className="eyebrow">Find your piece</span>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">Search</h1>
      </div>

      <form action="/search" method="get" className="mx-auto mt-8 flex max-w-xl gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search necklaces, rings, materials…"
          autoFocus
          className="w-full rounded-full border border-[var(--line-strong)] bg-surface/70 px-5 py-3 text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-hi to-gold px-7 py-3 text-sm font-medium text-maroon transition hover:opacity-90"
        >
          Search
        </button>
      </form>

      {q && (
        <div className="mt-12">
          <p className="mb-6 text-sm text-muted">
            {products.length} result{products.length === 1 ? "" : "s"} for{" "}
            <span className="text-ink">“{q}”</span>
          </p>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
