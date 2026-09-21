// Plain, serializable view models used across the storefront UI.
// (Prisma returns Decimal for money — we convert to number here so these
//  objects can be safely passed to client components.)

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  material: string | null;
  stock: number;
  images: string[];
  featured: boolean;
  category: { name: string; slug: string };
};

export type ProductFilters = {
  categorySlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  sort?: "newest" | "price-asc" | "price-desc";
};
