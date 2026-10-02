import Link from "next/link";
import type { ProductView } from "@/lib/types";
import { formatPrice, discountPercent } from "@/lib/format";
import { ProductImage } from "./product-image";
import { QuickAdd } from "./quick-add";

export function ProductCard({ product }: { product: ProductView }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-surface/70 transition hover:border-gold hover:shadow-[0_18px_40px_-24px_rgba(38,8,16,0.5)]">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-sand">
        <div className="h-full w-full transition duration-500 group-hover:scale-105">
          <ProductImage src={product.images[0]} alt={product.name} seed={product.slug} />
        </div>
        {off && (
          <span className="absolute left-3 top-3 rounded-full bg-maroon px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-gold">
            −{off}%
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-white">
            Sold out
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
          {product.category.name}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-[3.25rem] font-serif text-lg leading-snug text-ink transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-medium text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <QuickAdd product={product} />
      </div>
    </div>
  );
}
