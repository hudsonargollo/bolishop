import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getMaterials } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/filters";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { Emblem } from "@/components/brand/emblem";

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Not found" };
  return {
    title: cat.name,
    description: cat.description ?? `Shop ZARIERA ${cat.name.toLowerCase()}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const sp = await searchParams;
  const parsed = parseProductFilters(sp);
  const filters = { ...parsed, categorySlug: cat.slug };
  const [products, materials] = await Promise.all([
    getProducts(filters),
    getMaterials(),
  ]);

  const hasFilters = Boolean(parsed.q || parsed.material || parsed.minPrice || parsed.maxPrice);

  // Category with no products yet → elegant "Coming soon" (e.g. Necklaces, Earrings).
  if (products.length === 0 && !hasFilters) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Emblem size={48} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-4 block">{cat.name}</span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-ink sm:text-5xl">Coming soon</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Our {cat.name.toLowerCase()} collection is on its way. Stay tuned — beautiful new
          pieces are launching shortly.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-maroon px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2"
          >
            Shop available pieces
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm text-ink transition hover:border-gold hover:text-gold-deep"
          >
            Notify me
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ShopBrowser
      eyebrow="Collection"
      title={cat.name}
      description={cat.description}
      products={products}
      materials={materials}
    />
  );
}
