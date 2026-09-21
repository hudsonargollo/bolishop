"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { ProductImage } from "./product-image";

// Amazon/Walmart-style hover-to-zoom for the main product image.
// On desktop, hovering magnifies the exact spot under the cursor; the zoom
// origin follows the mouse. On touch devices (no hover), it stays a normal
// image so the browser's own pinch-zoom still works.
export function ZoomImage({
  src,
  alt,
  seed,
  zoom = 2.4,
}: {
  src?: string;
  alt: string;
  seed: string;
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  // No real photo yet → just the branded placeholder, no zoom.
  if (!src) {
    return <ProductImage src={src} alt={alt} seed={seed} />;
  }

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMove}
      className="group relative h-full w-full cursor-zoom-in overflow-hidden"
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200 ease-out"
        style={{ transform: active ? `scale(${zoom})` : "scale(1)", transformOrigin: origin }}
        draggable={false}
      />
      {/* Subtle hint (desktop only) */}
      <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[0.7rem] font-medium text-white backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-0 md:flex">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
        </svg>
        Hover to zoom
      </span>
    </div>
  );
}
