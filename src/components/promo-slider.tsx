"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Emblem } from "./brand/emblem";

// Editorial model & statement-jewelry shots. Horizontal sliding carousel
// (auto right→left) with a seamless two-way infinite loop and manual arrows.
// Split layout: text on the maroon panel, photo in its own frame so the
// jewelry is always fully visible. `focus` sets the vertical crop point
// (where the jewelry sits in each photo) so necklaces/earrings stay in view.
const SLIDES: { src: string; focus: string }[] = [
  { src: "/images/promo/promo-01.jpg", focus: "center 60%" },
  { src: "/images/promo/promo-02.jpg", focus: "center 42%" },
  { src: "/images/promo/promo-03.jpg", focus: "center 66%" },
  { src: "/images/promo/promo-04.jpg", focus: "center 60%" },
  { src: "/images/promo/promo-05.jpg", focus: "center 55%" },
  { src: "/images/promo/promo-06.jpg", focus: "center 48%" },
  { src: "/images/promo/promo-07.jpg", focus: "center 44%" },
  { src: "/images/promo/promo-08.jpg", focus: "center 58%" },
  { src: "/images/promo/promo-09.jpg", focus: "center 40%" },
  { src: "/images/promo/promo-10.jpg", focus: "center 55%" },
  { src: "/images/promo/promo-11.jpg", focus: "center 64%" },
  { src: "/images/promo/promo-12.jpg", focus: "center 55%" },
  { src: "/images/promo/promo-13.jpg", focus: "center 45%" }, // rings on satin
  { src: "/images/promo/promo-14.jpg", focus: "center 52%" }, // stacked bangles
  { src: "/images/promo/promo-15.jpg", focus: "center 52%" }, // rings + bracelet
  { src: "/images/promo/promo-16.jpg", focus: "center 42%" }, // bracelets + face
];

const INTERVAL = 4500;
const N = SLIDES.length;
const TOTAL = N + 2; // clones at both ends for a seamless two-way loop
// [ lastClone, slide0 … slideN-1, firstClone ]
const TRACK = [SLIDES[N - 1], ...SLIDES, SLIDES[0]];

export function PromoSlider() {
  const [index, setIndex] = useState(1); // 1..N are the real slides
  const [anim, setAnim] = useState(true);
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setAnim(true);
    setIndex((i) => i + 1);
  }, []);
  const goPrev = useCallback(() => {
    setAnim(true);
    setIndex((i) => i - 1);
  }, []);

  // autoplay
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) goNext();
    }, INTERVAL);
    return () => clearInterval(id);
  }, [goNext]);

  // re-enable animation on the frame after a seamless snap disabled it
  useEffect(() => {
    if (anim) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    return () => cancelAnimationFrame(r);
  }, [anim]);

  // when a clone finishes showing, snap (without anim) to its real twin
  const handleTransitionEnd = () => {
    if (index === TOTAL - 1) {
      setAnim(false);
      setIndex(1); // firstClone → real first slide
    } else if (index === 0) {
      setAnim(false);
      setIndex(N); // lastClone → real last slide
    }
  };

  const activeDot = (index - 1 + N) % N;

  return (
    <section
      className="relative overflow-hidden bg-maroon text-light"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* ── Text panel ── */}
        <div className="relative z-10 order-2 flex flex-col items-center justify-center px-6 py-16 text-center lg:order-1 lg:items-start lg:px-14 lg:py-24 lg:text-left">
          <Emblem size={40} className="text-gold" />
          <span className="eyebrow mt-4 block text-gold">Signature edit</span>
          <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
            Handcrafted for every occasion
          </h2>
          <p className="mt-4 max-w-md text-light/80">
            From everyday elegance to bridal statements — discover pieces made to be treasured
            for generations.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-gold-hi to-gold px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-maroon shadow-[0_14px_34px_-14px_rgba(230,205,139,0.7)] transition hover:opacity-90"
          >
            Shop the Collection
          </Link>

          {/* Controls — one row under the CTA (never on top of the photo):
              ‹  03 / 16 + progress (mobile/tablet) or dots (desktop)  › */}
          <div className="mt-9 flex w-full max-w-[17rem] items-center justify-center gap-4 sm:max-w-xs lg:max-w-none lg:justify-start">
            <ArrowButton dir="prev" onClick={goPrev} />

            {/* Compact counter + progress for small screens */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 lg:hidden" aria-live="polite">
              <span className="font-serif text-sm tracking-[0.2em] text-light/85 [font-variant-numeric:tabular-nums]">
                <span className="text-gold">{String(activeDot + 1).padStart(2, "0")}</span>
                <span className="mx-1.5 text-light/40">/</span>
                {String(N).padStart(2, "0")}
              </span>
              <span className="h-0.5 w-full max-w-[9rem] overflow-hidden rounded-full bg-light/20">
                <span
                  className="block h-full rounded-full bg-gold transition-[width] duration-700"
                  style={{ width: `${((activeDot + 1) / N) * 100}%` }}
                />
              </span>
            </div>

            {/* Dots on desktop */}
            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAnim(true);
                    setIndex(i + 1);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === activeDot}
                  className={`h-2 rounded-full transition-all ${
                    i === activeDot ? "w-7 bg-gold" : "w-2 bg-light/40 hover:bg-light/70"
                  }`}
                />
              ))}
            </div>

            <ArrowButton dir="next" onClick={goNext} />
          </div>
        </div>

        {/* ── Image slider ── */}
        <div
          className="relative order-1 min-h-[62vh] touch-pan-y overflow-hidden lg:order-2 lg:min-h-[600px]"
          // Swipe left/right on touch screens
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
            paused.current = true;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            paused.current = false;
            if (start == null) return;
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) (dx < 0 ? goNext : goPrev)();
          }}
        >
          {/* Sliding track */}
          <div
            className="flex h-full"
            onTransitionEnd={handleTransitionEnd}
            style={{
              width: `${TOTAL * 100}%`,
              transform: `translateX(-${(index * 100) / TOTAL}%)`,
              transition: anim ? "transform 900ms cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
          >
            {TRACK.map((slide, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="h-full bg-cover"
                style={{
                  width: `${100 / TOTAL}%`,
                  // Lazy: only the visible slide and its neighbours download
                  // (was all 16 photos on page load). Revisits come from cache.
                  backgroundImage: Math.abs(i - index) <= 1 ? `url(${slide.src})` : undefined,
                  backgroundPosition: slide.focus,
                }}
              />
            ))}
          </div>

          {/* Light vignette for depth + seam blend toward the maroon panel */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(61,16,25,0.55) 0%, rgba(61,16,25,0.12) 22%, rgba(61,16,25,0) 45%), linear-gradient(180deg, rgba(38,8,16,0.18) 0%, rgba(38,8,16,0.28) 100%)",
            }}
          />
        </div>
      </div>

      {/* Thin gold inset frame around the whole band */}
      <div className="pointer-events-none absolute inset-4 z-10 border border-[rgba(230,205,139,0.3)] sm:inset-6" />
    </section>
  );
}

function ArrowButton({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(230,205,139,0.5)] text-gold transition hover:bg-gold hover:text-maroon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
