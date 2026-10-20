"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
  materials: string[];
  showSort?: boolean;
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ShopFilters({ materials, showSort = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const currentMaterial = params.get("material") ?? "";
  const currentSort = params.get("sort") ?? "newest";
  const currentMin = params.get("minPrice") ?? "";
  const currentMax = params.get("maxPrice") ?? "";

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === null || val === "") next.delete(key);
        else next.set(key, val);
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const hasFilters = currentMaterial || currentMin || currentMax;

  return (
    <aside className="space-y-8">
      {showSort && (
        <div>
          <h3 className="eyebrow mb-3">Sort</h3>
          <select
            value={currentSort}
            onChange={(e) => setParam({ sort: e.target.value })}
            className="w-full rounded-md border border-[var(--line-strong)] bg-surface/70 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3 className="eyebrow mb-3">Material</h3>
        <div className="space-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="material"
              checked={!currentMaterial}
              onChange={() => setParam({ material: null })}
              className="accent-[var(--color-gold-deep)]"
            />
            <span className={!currentMaterial ? "text-ink" : "text-muted"}>All materials</span>
          </label>
          {materials.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="material"
                checked={currentMaterial === m}
                onChange={() => setParam({ material: m })}
                className="accent-[var(--color-gold-deep)]"
              />
              <span className={currentMaterial === m ? "text-ink" : "text-muted"}>{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="eyebrow mb-3">Price (Rs)</h3>
        <form
          // Re-mount when the URL range changes (e.g. "Clear filters") so the
          // inputs always show the active values.
          key={`${currentMin}|${currentMax}`}
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            let min = (data.get("minPrice") as string) || "";
            let max = (data.get("maxPrice") as string) || "";
            if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
            setParam({ minPrice: min || null, maxPrice: max || null });
          }}
        >
          <input
            name="minPrice"
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={currentMin}
            className="w-full rounded-md border border-[var(--line-strong)] bg-surface/70 px-2.5 py-2 text-sm outline-none focus:border-gold"
          />
          <span className="text-muted">–</span>
          <input
            name="maxPrice"
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={currentMax}
            className="w-full rounded-md border border-[var(--line-strong)] bg-surface/70 px-2.5 py-2 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="rounded-md bg-maroon px-3 py-2 text-xs font-medium text-gold transition hover:opacity-90"
          >
            Apply
          </button>
        </form>
      </div>

      {hasFilters && (
        <button
          onClick={() => setParam({ material: null, minPrice: null, maxPrice: null })}
          className="text-sm text-gold-deep underline-offset-4 hover:underline"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
