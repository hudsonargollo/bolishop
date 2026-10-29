import type { Metadata } from "next";
import { NotifyForm } from "@/components/notify-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getShopFacets } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/filters";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { Emblem } from "@/components/brand/emblem";
import { requireTenant } from "@/lib/tenant";

export async function generateMetadata({
  params,
}: PageProps<"/[tenant]/shop/[category]">): Promise<Metadata> {
  const { category, tenant: tenantSlug } = await params;
  const tenant = await requireTenant(tenantSlug);
  const cat = await getCategoryBySlug(tenant.id, category);
  if (!cat) return { title: "Not found" };
  return {
    title: cat.name,
    description: cat.description ?? `Shop ZARIERA ${cat.name.toLowerCase()}.`,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[tenant]/shop/[category]">) {
  const { category, tenant: tenantSlug } = await params;
  const tenant = await requireTenant(tenantSlug);
  const cat = await getCategoryBySlug(tenant.id, category);
  if (!cat) notFound();

  const sp = await searchParams;
  const parsed = parseProductFilters(sp);
  const filters = { ...parsed, categorySlug: cat.slug };
  const [products, facets] = await Promise.all([
    getProducts(tenant.id, filters),
    getShopFacets(tenant.id, cat.slug),
  ]);

  const hasFilters = Boolean(
    parsed.q || parsed.material || parsed.minPrice || parsed.maxPrice || parsed.onSale || parsed.inStock
  );

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
            className="rounded-full bg-maroon px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-light transition hover:bg-maroon-2"
          >
            Shop available pieces
          </Link>
        </div>
        <div className="mt-8">
          <p className="mb-3 text-sm text-muted">Get an email when they launch:</p>
          <NotifyForm slug={cat.slug} label={cat.name} />
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
      facets={facets}
    />
  );
}
