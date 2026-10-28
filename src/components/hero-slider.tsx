"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import Link from "next/link";
import { Emblem } from "./brand/emblem";

// Mix of product shots and models wearing jewelry.
// Models wearing modern, everyday jewelry (gold-plated / silver-tone stainless steel).
const SLIDES = [
  "/images/girl-1.webp",
  "/images/girl-2.webp",
  "/images/model1.webp",
  "/images/girl-3.webp",
  "/images/story-model.webp",
];

const INTERVAL = 5000;

export function HeroSlider() {
  // The first photo is a CSS background (found late by the browser) and the
  // biggest thing above the fold — fetch it straight away.
  preload(SLIDES[0], { as: "image", fetchPriority: "high" });
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative overflow-hidden bg-maroon text-light"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* Slides (cross-fade) */}
      {SLIDES.map((src, i) => {
        // Only download the visible slide and its neighbours (needed for the
        // cross-fade) — not all 5 photos on first load.
        const n = SLIDES.length;
        const near = i === index || i === (index + 1) % n || i === (index - 1 + n) % n;
        return (
          <div
            key={src}
            aria-hidden="true"
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={near ? { backgroundImage: `url(${src})` } : undefined}
          />
        );
      })}

      {/* Maroon overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(38,8,16,0.6) 0%, rgba(38,8,16,0.7) 55%, rgba(38,8,16,0.9) 100%)",
        }}
      />
      {/* Thin gold inset frame */}
      <div className="pointer-events-none absolute inset-4 border border-[rgba(230,205,139,0.4)] sm:inset-6" />

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-6 py-32 text-center sm:py-44">
        <Emblem size={56} className="mx-auto animate-floaty text-gold" />
        <h1 className="mt-5 gold-text font-serif text-5xl font-bold tracking-[0.2em] sm:text-7xl">
          ZARIERA
        </h1>
        <p className="mt-4 font-serif text-2xl italic text-light/90 sm:text-3xl">
          Every Jewel Tells a Story
        </p>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-light/70">
          Premium Stainless Steel Jewelry
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-maroon transition hover:opacity-90"
          >
            Explore Our Collection
          </Link>
          <Link
            href="/about"
            className="inline-block rounded-full border border-[rgba(230,205,139,0.5)] px-9 py-3.5 text-sm font-light uppercase tracking-[0.12em] text-light transition hover:border-gold hover:text-gold"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-7 bg-gold" : "w-2 bg-cream/40 hover:bg-cream/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
