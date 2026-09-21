import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";

export const metadata: Metadata = {
  title: "Care Guide",
  description: "How to care for your ZARIERA stainless steel jewelry so it stays brilliant for years.",
};

const TIPS = [
  {
    title: "Keep it dry",
    body: "Remove jewelry before showering, swimming or exercising. Moisture and sweat can dull the finish over time.",
  },
  {
    title: "Last on, first off",
    body: "Put jewelry on after applying perfume, lotion and makeup, and take it off before bed to avoid buildup and snags.",
  },
  {
    title: "Store separately",
    body: "Keep pieces in a soft pouch or lined box, apart from one another, to prevent scratches and tangling.",
  },
  {
    title: "Clean gently",
    body: "Wipe with a soft, dry cloth after wear. For a deeper clean, use lukewarm water with mild soap and a soft brush, then dry fully.",
  },
  {
    title: "Handle with care",
    body: "Avoid harsh chemicals, chlorine and abrasive cleaners. Take off rings when using cleaning products.",
  },
  {
    title: "Check settings",
    body: "Periodically check clasps and stone settings. If something feels loose, reach out — we're happy to help.",
  },
];

export default function CarePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-3 block">Help</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">Care Guide</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          A little care keeps your jewelry brilliant for generations.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-xl border border-[var(--line)] bg-cream-soft p-6">
            <h2 className="font-serif text-xl font-semibold text-ink">{t.title}</h2>
            <p className="mt-2 text-sm text-ink/80">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
