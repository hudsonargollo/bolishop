import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatPrice, discountPercent } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { ZoomImage } from "@/components/zoom-image";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/cart/add-to-cart";
import { JsonLd } from "@/components/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  const description = product.description ?? `${product.name} — ZARIERA stainless steel jewelry.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} · ZARIERA`,
      description,
      type: "website",
      url: `${siteUrl}/product/${product.slug}`,
      images: product.images.length ? product.images : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const off = discountPercent(product.price, product.compareAtPrice);
  const related = await getRelatedProducts(product);
  const inStock = product.stock > 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    category: product.category.name,
    ...(product.material ? { material: product.material } : {}),
    ...(product.images.length ? { image: product.images } : {}),
    brand: { "@type": "Brand", name: "ZARIERA" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <JsonLd data={productJsonLd} />
      {/* Breadcrumb */}
      <nav className="text-sm text-muted">
        <Link href="/shop" className="hover:text-gold-deep">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/shop/${product.category.slug}`} className="hover:text-gold-deep">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-sand">
            <ZoomImage src={product.images[0]} alt={product.name} seed={product.slug} />
          </div>
          {/* Only show thumbnails when there are genuinely multiple images —
              a single product photo needs no thumbnail strip. */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg border border-[var(--line)] bg-sand"
                >
                  <ProductImage
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    seed={`${product.slug}-${i}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {product.category.name}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {off && (
              <span className="rounded-full bg-maroon px-2.5 py-1 text-xs font-medium text-gold">
                Save {off}%
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink/80">{product.description}</p>

          <dl className="mt-6 space-y-2 border-t border-[var(--line)] pt-6 text-sm">
            {product.material && (
              <div className="flex gap-3">
                <dt className="w-28 text-muted">Material</dt>
                <dd className="text-ink">{product.material}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="w-28 text-muted">Availability</dt>
              <dd className={inStock ? "text-green-700" : "text-red-700"}>
                {inStock ? `In stock (${product.stock})` : "Sold out"}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
                material: product.material,
                stock: product.stock,
              }}
            />
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>✓ Cash on Delivery available</li>
            <li>✓ Complimentary care guidance with every order</li>
            <li>✓ Secure checkout</li>
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-semibold text-ink">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
