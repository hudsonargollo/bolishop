import Link from "next/link";
import type { ProductView } from "@/lib/types";
import { formatPrice, discountPercent, savingsOf } from "@/lib/format";
import { SaleRibbon, SaveLine } from "./ui/sale-badge";
import { ProductImage } from "./product-image";
import { QuickAdd } from "./quick-add";

export function ProductCard({ product }: { product: ProductView }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const saved = savingsOf(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-lg border bg-surface/70 transition hover:border-gold hover:shadow-[0_18px_40px_-24px_rgba(38,8,16,0.5)] ${
        off ? "border-gold/55" : "border-[var(--line)]"
      }`}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-sand">
        <div className="h-full w-full transition duration-500 group-hover:scale-105">
          <ProductImage src={product.images[0]} alt={product.name} seed={product.slug} />
        </div>
        {off && <SaleRibbon percent={off} />}
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
        <div className="mt-auto pt-3">
          {saved ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-lg font-semibold text-maroon dark:text-gold-hi">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted line-through decoration-maroon/50 dark:decoration-gold/60">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              </div>
              <SaveLine amount={saved} />
            </>
          ) : (
            <span className="font-medium text-ink">{formatPrice(product.price)}</span>
          )}
        </div>
        <QuickAdd product={product} />
      </div>
    </div>
  );
}
