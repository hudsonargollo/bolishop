import { prisma } from "./prisma";
import { sampleCategories, sampleProducts } from "./sample-data";
import type { CategoryView, ProductView, ProductFilters } from "./types";

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
  const { categorySlug, q, minPrice, maxPrice, material, sort = "newest" } = filters;

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
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { description: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
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
    return products.map(toView);
  } catch (err) {
    warnFallback(err);
    return filterSample(filters);
  }
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

export async function getMaterials(): Promise<string[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { active: true, material: { not: null } },
      select: { material: true },
      distinct: ["material"],
    });
    const mats = rows.map((r) => r.material).filter((m): m is string => !!m);
    if (mats.length === 0) return distinctSampleMaterials();
    return mats.sort();
  } catch (err) {
    warnFallback(err);
    return distinctSampleMaterials();
  }
}

// ---------- Sample-data filtering (mirrors the Prisma query) ----------

function distinctSampleMaterials(): string[] {
  return [...new Set(sampleProducts.map((p) => p.material).filter((m): m is string => !!m))].sort();
}

function filterSample(filters: ProductFilters): ProductView[] {
  const { categorySlug, q, minPrice, maxPrice, material, sort = "newest" } = filters;
  let list = [...sampleProducts];

  if (categorySlug) list = list.filter((p) => p.category.slug === categorySlug);
  if (material) list = list.filter((p) => p.material === material);
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.description?.toLowerCase().includes(needle) ?? false)
    );
  }

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);

  return list;
}
