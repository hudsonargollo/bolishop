import type { ProductFilters } from "./types";

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = first(v);
  if (s == null || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

// Turns URL search params into a validated ProductFilters object.
export function parseProductFilters(sp: RawParams): ProductFilters {
  const sortRaw = first(sp.sort);
  const sort =
    sortRaw === "price-asc" || sortRaw === "price-desc" || sortRaw === "newest"
      ? sortRaw
      : "newest";

  return {
    q: first(sp.q),
    material: first(sp.material),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    sort,
  };
}
