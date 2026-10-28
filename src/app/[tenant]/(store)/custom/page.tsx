import type { Metadata } from "next";
import { OrnateFrame } from "@/components/ornate-frame";
import { Emblem } from "@/components/brand/emblem";
import { CustomDesignForm } from "@/components/custom-design-form";
import { getStoreSettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/settings-shared";

export const metadata: Metadata = {
  alternates: { canonical: "/custom" },
  title: "Custom Jewelry",
  description: "Design a one-of-a-kind piece with ZARIERA's custom jewelry service.",
};

const STEPS = [
  { n: "1", title: "Share your vision", body: "Tell us your idea, occasion and budget." },
  { n: "2", title: "Design & approve", body: "We craft a design and refine it with you." },
  { n: "3", title: "Handcrafted for you", body: "Your one-of-a-kind piece is made and delivered." },
];

export default async function CustomPage() {
  const settings = await getStoreSettings();
  return (
    <div className="bg-cream px-5 py-12">
      <OrnateFrame className="mx-auto max-w-4xl bg-panel">
        <div className="px-6 py-16 text-center sm:px-14">
          <Emblem size={48} className="mx-auto text-gold-deep" />
          <span className="eyebrow mt-4 block">Bespoke</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">
            Custom Jewelry
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-ink/80">
            From personalized name necklaces to custom sets for your big day, we bring your
            idea to life in premium stainless steel. Share your design and we&apos;ll craft
            something uniquely yours.
          </p>
          {/* Jumps to the design request form further down this page */}
          <a
            href="#design-request"
            className="mt-9 inline-block rounded-full bg-maroon px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-light transition hover:bg-maroon-2"
          >
            Request a Custom Piece
          </a>
          <p className="mt-3 text-xs text-muted">
            Fill a short form — takes 2 minutes, no payment needed.
          </p>
        </div>
      </OrnateFrame>

      <section className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-lg border border-[var(--line)] bg-cream-soft p-7 text-center"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-maroon font-serif text-lg text-gold">
              {s.n}
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </section>

      {/* Design request form */}
      <section
        id="design-request"
        className="mx-auto mt-14 max-w-4xl scroll-mt-28 rounded-2xl border border-[var(--line)] bg-cream-soft p-6 sm:p-10"
      >
        <div className="text-center">
          <span className="eyebrow">Step 1</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">Tell us about your piece</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Fill in what you can — we&apos;ll get back to you within 1–2 working days with design ideas and a
            price.
          </p>
        </div>
        <div className="mt-8">
          <CustomDesignForm whatsappUrl={whatsappUrl(settings) || undefined} />
        </div>
      </section>
    </div>
  );
}
