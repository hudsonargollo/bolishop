import type { Metadata } from "next";
import { getProducts, getShopFacets } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/filters";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { requireTenant } from "@/lib/tenant";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop All Jewelry",
  description: "Browse the full ZARIERA collection of premium stainless steel & artificial jewelry.",
};

export default async function ShopPage({
  params,
  searchParams,
}: PageProps<"/[tenant]/shop">) {
  const { tenant: tenantSlug } = await params;
  const tenant = await requireTenant(tenantSlug);
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const [products, facets] = await Promise.all([
    getProducts(tenant.id, filters),
    getShopFacets(tenant.id),
  ]);

  return (
    <ShopBrowser
      eyebrow="The Collection"
      title="All Jewelry"
      description="Premium stainless steel & gold-plated pieces — rust-free and made to last. Refine by category, price, offers or material to find your next favorite."
      products={products}
      facets={facets}
    />
  );
}
