"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";
import { ZoomImage } from "./zoom-image";

// Main hover-zoom image + clickable thumbnails that switch it.
export function ProductGallery({ images, name, slug }: { images: string[]; name: string; slug: string }) {
  const [active, setActive] = useState(0);
  const thumbs = images.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-sand">
        <ZoomImage key={active} src={images[active]} alt={name} seed={slug} />
      </div>
      {thumbs.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {thumbs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${name} view ${i + 1}`}
              aria-pressed={active === i}
              className={`aspect-square overflow-hidden rounded-lg border bg-sand transition ${
                active === i ? "border-gold ring-2 ring-gold/40" : "border-[var(--line)] hover:border-gold"
              }`}
            >
              <ProductImage src={src} alt={`${name} view ${i + 1}`} seed={`${slug}-${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
