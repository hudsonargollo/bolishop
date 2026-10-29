import type { Metadata } from "next";
import Link from "next/link";
import { searchStore } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductGrid } from "@/components/product-grid";
import { SearchBox } from "@/components/search/search-box";
import { requireTenant } from "@/lib/tenant";

export async function generateMetadata({ searchParams }: PageProps<"/[tenant]/search">): Promise<Metadata> {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 60);
  return {
    robots: { index: false, follow: true },
    title: q ? `Search: ${q}` : "Search",
    description: "Search the ZARIERA collection.",
  };
}

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] bg-surface/70 px-4 py-1.5 text-sm text-ink transition hover:border-gold hover:bg-gold/10";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-deep">
      {children}
    </span>
  );
}

export default async function SearchPage({ params, searchParams }: PageProps<"/[tenant]/search">) {
  const { tenant: tenantSlug } = await params;
  const tenant = await requireTenant(tenantSlug);
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? "";
  const result = await searchStore(tenant.id, q);
  const { products, category, corrections, minPrice, maxPrice, onSale, partial, categories, all } = result;
  const live = categories.filter((c) => c.count > 0);

  // Something to show when nothing matched (or nothing was typed yet).
  const needPicks = !q || products.length === 0;
  const picks = needPicks
    ? all
        .filter((p) => p.stock > 0)
        .sort((a, b) => Number(b.featured) - Number(a.featured))
        .slice(0, 4)
    : [];
  // "Under Rs …" chip a little above the cheapest piece, rounded to 500.
  const cheapest = all.length ? Math.min(...all.map((p) => p.price)) : 0;
  const budget = Math.ceil((cheapest + 600) / 500) * 500;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
      {/* Hero */}
      {/* No overflow-hidden here: the suggestion panel has to hang out of the hero. */}
      <section className="relative z-30 rounded-3xl border border-[var(--line)] bg-gradient-to-b from-panel/70 via-cream-soft/60 to-transparent px-4 pb-10 pt-12 text-center sm:px-8">
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <span className="absolute -top-24 left-1/2 h-56 w-[32rem] max-w-full -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />
        </span>
        <div className="relative">
          <span className="eyebrow">Find your piece</span>
          <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Search the collection</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Type a piece, a style or a budget — spelling doesn&apos;t have to be perfect.
          </p>
          <div className="mt-7">
            <SearchBox key={q} initial={q} autoFocus={!q} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">Popular</span>
            {live.map((c) => (
              <Link key={c.slug} href={`/search?q=${encodeURIComponent(c.name.toLowerCase())}`} className={chip}>
                {c.name} <span className="text-xs text-muted">{c.count}</span>
              </Link>
            ))}
            <Link href="/search?q=sale" className={chip}>
              <span className="text-gold-deep">✦</span> On sale
            </Link>
            {cheapest > 0 && (
              <Link href={`/search?q=${encodeURIComponent(`under ${budget}`)}`} className={chip}>
                Under {formatPrice(budget)}
              </Link>
            )}
          </div>
        </div>
      </section>

      {q && (
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div>
              <p className="text-sm text-muted">
                {partial
                  ? "No exact match — closest pieces for"
                  : products.length
                    ? `${products.length} piece${products.length === 1 ? "" : "s"} for`
                    : "You searched for"}{" "}
                <span className="font-serif text-xl text-ink">“{q}”</span>
              </p>
              {corrections.length > 0 && (
                <p className="mt-1 text-sm text-muted">
                  Showing results for{" "}
                  <span className="font-semibold text-gold-deep">{corrections.map((c) => c.to).join(", ")}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {category && <Tag>Category · {category.name}</Tag>}
              {onSale && <Tag>On sale</Tag>}
              {minPrice != null && <Tag>From {formatPrice(minPrice)}</Tag>}
              {maxPrice != null && <Tag>Up to {formatPrice(maxPrice)}</Tag>}
              {category && category.count > 0 && (
                <Link href={`/shop/${category.slug}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-maroon underline-offset-4 hover:underline dark:text-gold-hi">
                  Shop all {category.name} →
                </Link>
              )}
            </div>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-cream-soft via-surface to-panel px-6 py-12 text-center">
              <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/20 blur-2xl" aria-hidden="true" />
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 text-2xl text-gold-deep">✦</span>
              {category && category.count === 0 ? (
                <>
                  <h2 className="relative mt-4 font-serif text-2xl text-ink">Our {category.name.toLowerCase()} are coming soon</h2>
                  <p className="relative mx-auto mt-2 max-w-md text-sm text-muted">
                    This collection is being crafted right now. Get a note the moment it launches — or explore the pieces below.
                  </p>
                  <Link href={`/shop/${category.slug}`} className="relative mt-6 inline-flex rounded-full bg-maroon px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-light transition hover:bg-wine-deep">
                    Notify me when it launches
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="relative mt-4 font-serif text-2xl text-ink">Nothing matches “{q}” yet</h2>
                  <p className="relative mx-auto mt-2 max-w-md text-sm text-muted">
                    Try a type of piece — ring, bracelet, bangle — a detail like pearl or butterfly, or a budget like “under 3000”.
                  </p>
                </>
              )}
              <p className="relative mt-6 text-sm text-muted">
                Have something specific in mind?{" "}
                <Link href="/custom" className="font-semibold text-maroon underline underline-offset-4 dark:text-gold-hi">
                  Request a custom design
                </Link>
              </p>
            </div>
          )}
        </section>
      )}

      {picks.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">{q ? "You may love" : "Trending now"}</span>
              <h2 className="mt-2 font-serif text-3xl text-ink">{q ? "Pieces our clients adore" : "Most loved pieces"}</h2>
            </div>
            <Link href="/shop" className="text-sm text-gold-deep hover:underline">
              View all →
            </Link>
          </div>
          <ProductGrid products={picks} />
        </section>
      )}
    </div>
  );
}
