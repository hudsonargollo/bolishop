"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import type { ShopFacets } from "@/lib/types";
import { PriceRange } from "./price-range";

// Params owned by the sidebar; "Clear all" removes exactly these.
export const FILTER_KEYS = ["material", "minPrice", "maxPrice", "sale", "stock"] as const;

/** Read / update the shop's URL search params (filters live in the URL). */
export function useShopQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParams = useCallback(
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

  const num = (key: string) => {
    const v = params.get(key);
    const n = v == null || v === "" ? NaN : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return { params, pathname, setParams, num };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3.5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
        <span className="text-[0.55rem]" aria-hidden="true">◆</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-auto min-w-6 rounded-full bg-sand/70 px-1.5 py-0.5 text-center text-[0.65rem] font-medium text-muted">
      {n}
    </span>
  );
}

function Switch({
  label,
  hint,
  count,
  checked,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  count: number;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center gap-3 rounded-lg px-1 py-1.5 text-left text-sm"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gradient-to-r from-gold to-gold-deep" : "bg-[var(--line-strong)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow transition-all ${
            checked ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
      <span className={checked ? "font-medium text-ink" : "text-ink/80 group-hover:text-ink"}>{label}</span>
      {hint}
      <Count n={count} />
    </button>
  );
}

export function ShopFilters({ facets }: { facets: ShopFacets }) {
  const { params, pathname, setParams, num } = useShopQuery();

  const material = params.get("material") ?? "";
  const sale = params.get("sale") === "1";
  const stock = params.get("stock") === "1";
  const minPrice = num("minPrice");
  const maxPrice = num("maxPrice");

  const activeCategory = pathname.startsWith("/shop/") ? decodeURIComponent(pathname.slice(6)) : "";
  const qs = params.toString();
  const withQs = (path: string) => (qs ? `${path}?${qs}` : path);

  return (
    <div className="space-y-5">
      <Section title="Categories">
        <ul className="space-y-0.5 text-sm">
          {[{ name: "All Jewelry", slug: "", count: facets.total }, ...facets.categories].map((c) => {
            const active = activeCategory === c.slug;
            return (
              <li key={c.slug || "all"}>
                <Link
                  href={withQs(c.slug ? `/shop/${c.slug}` : "/shop")}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-lg py-2 pl-3 pr-1.5 transition ${
                    active
                      ? "bg-maroon/[0.07] font-medium text-maroon dark:bg-gold/10 dark:text-gold-hi"
                      : "text-ink/80 hover:bg-sand/50 hover:text-ink"
                  }`}
                >
                  {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gold" />}
                  {c.name}
                  {c.count > 0 ? (
                    <Count n={c.count} />
                  ) : (
                    <span className="ml-auto text-[0.6rem] uppercase tracking-[0.14em] text-muted">Soon</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Price">
        <PriceRange
          // re-sync when the URL range or the scope's bounds change
          key={`${minPrice}|${maxPrice}|${facets.priceMin}|${facets.priceMax}`}
          bounds={[facets.priceMin, facets.priceMax]}
          min={minPrice}
          max={maxPrice}
          onCommit={(min, max) =>
            setParams({ minPrice: min == null ? null : String(min), maxPrice: max == null ? null : String(max) })
          }
        />
      </Section>

      <Section title="Offers & availability">
        <div className="space-y-1">
          <Switch
            label="On sale"
            hint={
              <span className="rounded bg-maroon px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-gold-hi">
                % Off
              </span>
            }
            count={facets.onSale}
            checked={sale}
            onChange={(on) => setParams({ sale: on ? "1" : null })}
          />
          <Switch
            label="In stock only"
            count={facets.inStock}
            checked={stock}
            onChange={(on) => setParams({ stock: on ? "1" : null })}
          />
        </div>
      </Section>

      {facets.materials.length > 0 && (
        <Section title="Material">
          <div className="space-y-0.5 text-sm" role="radiogroup" aria-label="Material">
            {[{ name: "", count: 0 }, ...facets.materials].map((m) => {
              const checked = material === m.name;
              return (
                <button
                  key={m.name || "all"}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setParams({ material: m.name || null })}
                  className="group flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left"
                >
                  <span
                    className={`flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full border transition ${
                      checked ? "border-gold-deep" : "border-[var(--line-strong)] group-hover:border-gold"
                    }`}
                  >
                    {checked && <span className="h-2 w-2 rounded-full bg-gradient-to-br from-gold-hi to-gold-deep" />}
                  </span>
                  <span className={checked ? "font-medium text-ink" : "text-ink/80 group-hover:text-ink"}>
                    {m.name || "All materials"}
                  </span>
                  {m.name && <Count n={m.count} />}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
