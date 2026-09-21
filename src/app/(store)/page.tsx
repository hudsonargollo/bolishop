import Link from "next/link";
import { getFeaturedProducts, getProducts, getCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Emblem } from "@/components/brand/emblem";
import { HeroSlider } from "@/components/hero-slider";
import { CategoryArt } from "@/components/category-art";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { Testimonials } from "@/components/testimonials";
import { Newsletter } from "@/components/newsletter";
import { Reveal } from "@/components/reveal";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZARIERA",
  url: siteUrl,
  slogan: "Every Jewel Tells a Story",
  description:
    "Premium stainless steel and artificial jewelry — elegant, gold-plated, rust-free and hypoallergenic.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ZARIERA",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const TRUST = [
  { title: "Rust-free & hypoallergenic", body: "Premium stainless steel, gentle on skin." },
  { title: "Cash on Delivery", body: "Pay at your doorstep, nationwide." },
  { title: "Free shipping", body: "On orders over Rs 50,000." },
  { title: "Won't tarnish", body: "Keeps its shine wear after wear." },
];

export const revalidate = 300;

export default async function HomePage() {
  const [featured, bestSellers, categories] = await Promise.all([
    getFeaturedProducts(8),
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);
  const topCategories = categories.slice(0, 4);

  // Product count per category (to mark empty categories "Coming soon").
  const countBySlug: Record<string, number> = {};
  for (const p of bestSellers) {
    countBySlug[p.category.slug] = (countBySlug[p.category.slug] ?? 0) + 1;
  }

  // Real product images for the Instagram-style grid.
  const instaProducts = bestSellers.filter((p) => p.images.length > 0).slice(0, 6);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />

      {/* Hero slideshow */}
      <HeroSlider />

      {/* Trust badges */}
      <section className="border-b border-[var(--line)] bg-cream px-5 py-8">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="mt-0.5 text-gold-deep">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="font-serif text-lg text-ink">{t.title}</p>
                <p className="text-sm text-muted">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">Collections</span>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Shop by category</h2>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {topCategories.map((c, idx) => {
            const count = countBySlug[c.slug] ?? 0;
            const comingSoon = count === 0;

            const inner = (
              <>
                <CategoryArt slug={c.slug} className="h-24 w-24 text-gold-deep transition group-hover:scale-105" />
                <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{c.name}</h3>
                {comingSoon ? (
                  <span className="mt-1 rounded-full bg-maroon/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-maroon">
                    Coming soon
                  </span>
                ) : (
                  <span className="mt-1 text-xs uppercase tracking-[0.18em] text-gold-deep">
                    Shop now →
                  </span>
                )}
              </>
            );

            return (
              <Reveal key={c.slug} delay={(idx % 4) * 80}>
                {comingSoon ? (
                  <div className="flex h-full flex-col items-center rounded-xl border border-[var(--line)] bg-panel p-8 text-center opacity-80">
                    {inner}
                  </div>
                ) : (
                  <Link
                    href={`/shop/${c.slug}`}
                    className="group flex h-full flex-col items-center rounded-xl border border-[var(--line)] bg-panel p-8 text-center transition hover:border-gold hover:shadow-[0_18px_40px_-24px_rgba(91,26,43,0.4)]"
                  >
                    {inner}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Best sellers */}
      <section className="bg-cream-soft px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex items-end justify-between">
              <div>
                <span className="eyebrow">Most loved</span>
                <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Best sellers</h2>
              </div>
              <Link href="/shop" className="text-sm font-medium text-gold-deep hover:text-gold">
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo band */}
      <section className="relative overflow-hidden bg-maroon px-5 py-24 text-cream">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/promo-bangles.jpg)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(61,16,25,0.82), rgba(61,16,25,0.9))",
          }}
        />
        <div className="pointer-events-none absolute inset-4 border border-[rgba(230,205,139,0.35)] sm:inset-6" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Emblem size={40} className="mx-auto text-gold" />
          <span className="eyebrow mt-4 block text-gold">Signature edit</span>
          <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            Handcrafted for every occasion
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            From everyday elegance to bridal statements — discover pieces made to be treasured
            for generations.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-maroon transition hover:opacity-90"
          >
            Shop the Collection
          </Link>
        </div>
      </section>

      {/* Featured carousel */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Curated</span>
              <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Featured pieces</h2>
            </div>
            <Link href="/shop" className="text-sm font-medium text-gold-deep hover:text-gold">
              View all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10">
          <FeaturedCarousel products={featured} />
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-cream px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-panel">
              <img
                src="/images/story-model.jpg"
                alt="A model wearing ZARIERA gold-plated stainless steel jewelry"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-3 border border-[rgba(230,205,139,0.6)]" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">Our story</span>
              <h2 className="mt-3 font-serif text-4xl font-bold text-ink sm:text-5xl">
                Craft, care &amp; a little sparkle
              </h2>
              <p className="mt-5 leading-relaxed text-ink/80">
                ZARIERA creates premium stainless steel and artificial jewelry — elegant,
                affordable and made to last. Our pieces are gold-plated over surgical-grade
                steel, so they stay rust-free, skin-friendly and never fade.
              </p>
              <p className="mt-4 leading-relaxed text-ink/80">
                We believe every jewel tells a story — of confidence, of everyday moments, of the
                people we treasure. Beautiful designs, without the fine-jewelry price tag.
              </p>
              <Link
                href="/about"
                className="mt-7 inline-block rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-ink transition hover:border-gold hover:text-gold-deep"
              >
                Discover ZARIERA
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Instagram / lookbook */}
      <section className="relative overflow-hidden bg-cream-soft px-5 py-24">
        {/* gold hairline + soft glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(169,126,48,0.4)] to-transparent" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(214,178,104,0.16), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-cream px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold-deep">
            <InstagramIcon size={15} />
            @zariera
          </span>
          <h2 className="mt-4 font-serif text-4xl font-bold text-ink sm:text-5xl">Follow our journey</h2>
          <p className="mt-3 text-muted">
            Real pieces, real sparkle — tag us with{" "}
            <span className="font-medium text-gold-deep">#EveryJewelTellsAStory</span>
          </p>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {instaProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                aria-label={p.name}
                className="group relative block aspect-square overflow-hidden rounded-xl ring-1 ring-[var(--line)] transition-all duration-500 hover:-translate-y-1 hover:ring-2 hover:ring-gold hover:shadow-[0_24px_48px_-24px_rgba(38,8,16,0.55)]"
              >
                <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110">
                  <ProductImage src={p.images[0]} alt={p.name} seed={p.slug} />
                </div>
                {/* darkening gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/85 via-wine-deep/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* product name reveal */}
                <span className="absolute inset-x-0 bottom-0 translate-y-2 px-3 pb-3 text-left text-[0.72rem] font-medium leading-tight text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.name}
                </span>
                {/* Instagram glyph */}
                <span className="absolute right-2.5 top-2.5 text-gold-hi opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <InstagramIcon size={18} />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-cream shadow-[0_14px_34px_-14px_rgba(91,26,43,0.7)] transition hover:bg-maroon-2"
            >
              <InstagramIcon size={18} />
              Follow @zariera
            </a>
            <Link
              href="/shop"
              className="rounded-full border border-[var(--line-strong)] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-ink transition hover:border-gold hover:text-gold-deep"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
