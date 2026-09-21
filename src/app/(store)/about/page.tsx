import type { Metadata } from "next";
import Link from "next/link";
import { OrnateFrame } from "@/components/ornate-frame";
import { Emblem } from "@/components/brand/emblem";

export const metadata: Metadata = {
  title: "About",
  description: "The ZARIERA story — premium stainless steel & artificial jewelry, made to last.",
};

export default function AboutPage() {
  return (
    <div className="bg-cream px-5 py-12">
      <OrnateFrame className="mx-auto max-w-4xl bg-panel">
        <div className="px-6 py-16 text-center sm:px-14">
          <Emblem size={48} className="mx-auto text-gold-deep" />
          <span className="eyebrow mt-4 block">Our Story</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">
            Craft, care &amp; a little sparkle
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-ink/80">
            ZARIERA creates premium stainless steel and artificial jewelry — elegant,
            affordable and made to last. Every piece is gold-plated over surgical-grade
            steel, so it stays rust-free, skin-friendly and never fades.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-ink/80">
            We believe every jewel tells a story — of confidence and everyday moments. Our
            mission is to bring you beautiful, long-lasting designs without the fine-jewelry
            price tag.
          </p>
          <Link
            href="/shop"
            className="mt-9 inline-block rounded-full bg-maroon px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2"
          >
            Explore Our Collection
          </Link>
        </div>
      </OrnateFrame>

      <section className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
        {[
          { title: "Rust-free", body: "Premium stainless steel that never rusts." },
          { title: "Skin-friendly", body: "Hypoallergenic — gentle on sensitive skin." },
          { title: "Won't tarnish", body: "Gold-plated finish that keeps its shine." },
        ].map((p) => (
          <div key={p.title} className="text-center">
            <h3 className="font-serif text-xl font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
