import { prisma } from "./prisma";
import { sampleCategories, sampleProducts } from "./sample-data";
import { searchCatalog, type SearchCategory, type SearchResult } from "./search-engine";
import type { CategoryView, ProductView, ProductFilters, ShopFacets } from "./types";

// The storefront reads through these functions. Each attempts a real Prisma
// query and gracefully falls back to bundled sample data when no database is
// connected yet — so the UI is fully previewable before DB hookup, and becomes
// live automatically once DATABASE_URL points at a seeded database.

let warned = false;
function warnFallback(err: unknown) {
  // In production this means the live DB is unreachable — log every time so it
  // shows up in the host's function logs instead of silently serving samples.
  if (process.env.NODE_ENV === "production") {
    console.error("[catalog] DATABASE UNAVAILABLE — serving sample data:", err);
    return;
  }
  if (!warned) {
    warned = true;
    console.warn(
      "[catalog] Database unavailable — serving sample data. Connect DATABASE_URL and run `npx prisma migrate dev` + `npm run db:seed` to go live.",
      err instanceof Error ? err.message : err
    );
  }
}

type PrismaProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: unknown;
  compareAtPrice: unknown;
  material: string | null;
  specs?: string | null;
  stock: number;
  images: string[];
  featured: boolean;
  category: { name: string; slug: string };
};

function toView(p: PrismaProduct): ProductView {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
    material: p.material,
    specs: p.specs ?? null,
    stock: p.stock,
    images: p.images ?? [],
    featured: p.featured,
    category: p.category,
  };
}

// ---------- Categories ----------

export async function getCategories(): Promise<CategoryView[]> {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
    }));
  } catch (err) {
    warnFallback(err);
    return sampleCategories;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryView | null> {
  try {
    const c = await prisma.category.findUnique({ where: { slug } });
    return c
      ? { id: c.id, name: c.name, slug: c.slug, description: c.description }
      : null;
  } catch (err) {
    warnFallback(err);
    return sampleCategories.find((c) => c.slug === slug) ?? null;
  }
}

// ---------- Products ----------

export async function getProducts(filters: ProductFilters = {}): Promise<ProductView[]> {
  const { categorySlug, q, minPrice, maxPrice, material, onSale, inStock, sort = "newest" } = filters;

  try {
    const orderBy =
      sort === "price-asc"
        ? { price: "asc" as const }
        : sort === "price-desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(material ? { material } : {}),
        ...(onSale ? { compareAtPrice: { gt: prisma.product.fields.price } } : {}),
        ...(inStock ? { stock: { gt: 0 } } : {}),
        ...(minPrice != null || maxPrice != null
          ? {
              price: {
                ...(minPrice != null ? { gte: minPrice } : {}),
                ...(maxPrice != null ? { lte: maxPrice } : {}),
              },
            }
          : {}),
      },
      include: { category: { select: { name: true, slug: true } } },
      orderBy,
    });
    return applyQuery(products.map(toView), q, sort);
  } catch (err) {
    warnFallback(err);
    return filterSample(filters);
  }
}

/** Text filter for the shop's `?q=`: the same typo-tolerant matching as /search,
 *  ranked by relevance unless a price sort was picked. */
function applyQuery(list: ProductView[], q: string | undefined, sort: ProductFilters["sort"]): ProductView[] {
  if (!q) return list;
  const cats = new Map<string, SearchCategory>();
  for (const p of list) {
    const c = cats.get(p.category.slug);
    if (c) c.count++;
    else cats.set(p.category.slug, { id: p.category.slug, name: p.category.name, slug: p.category.slug, description: null, count: 1 });
  }
  const found = searchCatalog(q, list, [...cats.values()]).products;
  if (sort === "price-asc") return found.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return found.sort((a, b) => b.price - a.price);
  return found;
}

// ---------- Search ----------

/** Full /search answer: ranked pieces plus how the query was read. All
 *  categories are passed (even empty ones) so "necklaces" can say "coming soon". */
export async function searchStore(
  q: string
): Promise<SearchResult & { categories: SearchCategory[]; all: ProductView[] }> {
  const [products, categoryList] = await Promise.all([getProducts(), getCategories()]);
  const categories = categoryList.map((c) => ({
    ...c,
    count: products.filter((p) => p.category.slug === c.slug).length,
  }));
  return { ...searchCatalog(q, products, categories), categories, all: products };
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { slug, active: true },
      include: { category: { select: { name: true, slug: true } } },
    });
    return p ? toView(p) : null;
  } catch (err) {
    warnFallback(err);
    return sampleProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function getFeaturedProducts(limit = 4): Promise<ProductView[]> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: { select: { name: true, slug: true } } },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (products.length === 0) return sampleProducts.filter((p) => p.featured).slice(0, limit);
    return products.map(toView);
  } catch (err) {
    warnFallback(err);
    return sampleProducts.filter((p) => p.featured).slice(0, limit);
  }
}

export async function getRelatedProducts(
  product: ProductView,
  limit = 4
): Promise<ProductView[]> {
  const all = await getProducts({ categorySlug: product.category.slug });
  return all.filter((p) => p.id !== product.id).slice(0, limit);
}

// ---------- Shop sidebar facets ----------

type FacetRow = {
  price: number;
  compareAtPrice: number | null;
  stock: number;
  material: string | null;
  category: { name: string; slug: string };
};

/** Category counts (whole store) + price bounds, materials, sale and stock counts
 *  for the current category scope. */
export async function getShopFacets(categorySlug?: string): Promise<ShopFacets> {
  let rows: FacetRow[];
  let cats: { name: string; slug: string }[];
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { active: true },
        select: {
          price: true,
          compareAtPrice: true,
          stock: true,
          material: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    ]);
    rows = products.map((p) => ({
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
      stock: p.stock,
      material: p.material,
      category: p.category,
    }));
    cats = categories;
  } catch (err) {
    warnFallback(err);
    rows = sampleProducts;
    cats = sampleCategories;
  }

  const scoped = categorySlug ? rows.filter((r) => r.category.slug === categorySlug) : rows;
  const prices = (scoped.length ? scoped : rows).map((r) => r.price);
  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 0;
  let priceMax = prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 0;
  if (priceMax <= priceMin) priceMax = priceMin + 100;

  const materialCounts = new Map<string, number>();
  for (const r of scoped) {
    if (r.material) materialCounts.set(r.material, (materialCounts.get(r.material) ?? 0) + 1);
  }

  return {
    total: rows.length,
    categories: cats.map((c) => ({
      ...c,
      count: rows.filter((r) => r.category.slug === c.slug).length,
    })),
    priceMin,
    priceMax,
    materials: [...materialCounts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    onSale: scoped.filter((r) => r.compareAtPrice != null && r.compareAtPrice > r.price).length,
    inStock: scoped.filter((r) => r.stock > 0).length,
  };
}

// ---------- Sample-data filtering (mirrors the Prisma query) ----------

function filterSample(filters: ProductFilters): ProductView[] {
  const { categorySlug, q, minPrice, maxPrice, material, onSale, inStock, sort = "newest" } = filters;
  let list = [...sampleProducts];

  if (categorySlug) list = list.filter((p) => p.category.slug === categorySlug);
  if (material) list = list.filter((p) => p.material === material);
  if (onSale) list = list.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);
  if (inStock) list = list.filter((p) => p.stock > 0);
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

  return applyQuery(list, q, sort);
}
