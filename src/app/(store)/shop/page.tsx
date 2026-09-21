import type { Metadata } from "next";
import { getProducts, getMaterials } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/filters";
import { ShopBrowser } from "@/components/shop/shop-browser";

export const metadata: Metadata = {
  title: "Shop All Jewelry",
  description: "Browse the full ZARIERA collection of premium stainless steel & artificial jewelry.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const [products, materials] = await Promise.all([
    getProducts(filters),
    getMaterials(),
  ]);

  return (
    <ShopBrowser
      eyebrow="The Collection"
      title="All Jewelry"
      description="Premium stainless steel &amp; gold-plated pieces — rust-free and made to last. Filter by material or price to find your next favourite."
      products={products}
      materials={materials}
    />
  );
}
