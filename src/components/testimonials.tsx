import { Emblem } from "./brand/emblem";

type Review = {
  text: string;
  name: string;
  place: string;
  rating: number;
};

const REVIEWS: Review[] = [
  {
    text: "The craftsmanship is exquisite. My necklace arrived beautifully packaged and looks even better in person.",
    name: "Ayesha Khan",
    place: "Lahore",
    rating: 5,
  },
  {
    text: "Ordered a custom ring for my engagement — ZARIERA made the whole process effortless and the result was stunning.",
    name: "Bilal Raza",
    place: "Karachi",
    rating: 5,
  },
  {
    text: "Elegant, timeless pieces and wonderful service. Cash on delivery made it so easy. Highly recommend.",
    name: "Sana Malik",
    place: "Islamabad",
    rating: 5,
  },
  {
    text: "I gifted my mother a pendant and she hasn't taken it off since. The finish is flawless and feels premium.",
    name: "Hamza Sheikh",
    place: "Rawalpindi",
    rating: 5,
  },
  {
    text: "Fast delivery and the earrings sparkle beautifully. Exactly what I hoped for — will definitely order again.",
    name: "Fatima Noor",
    place: "Faisalabad",
    rating: 5,
  },
  {
    text: "Genuinely luxury quality at a fair price. The team even called to confirm my order. Five stars.",
    name: "Zainab Ali",
    place: "Multan",
    rating: 5,
  },
];

// Row 1 = first half, Row 2 = second half (moving the opposite way).
const ROW_ONE = REVIEWS.slice(0, 3);
const ROW_TWO = REVIEWS.slice(3);

export function Testimonials() {
  return (
    <section className="bg-maroon py-20 text-cream">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-5 text-center">
        <Emblem size={40} className="mx-auto text-gold" />
        <span className="eyebrow mt-4 block text-gold">Testimonials</span>
        <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Loved by our clients</h2>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-cream/80">
          <Stars rating={5} />
          <span>
            <strong className="text-gold">4.9/5</strong> from 500+ happy clients
          </span>
        </div>
      </div>

      {/* Two rows of auto-scrolling cards moving in opposite directions */}
      <div className="marquee-pause mt-12 space-y-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
        <Row reviews={ROW_ONE} direction="forward" />
        <Row reviews={ROW_TWO} direction="reverse" />
      </div>
    </section>
  );
}

function Row({ reviews, direction }: { reviews: Review[]; direction: "forward" | "reverse" }) {
  // Repeat enough times to fill wide screens, then duplicate for a seamless -50% loop.
  const base = [...reviews, ...reviews, ...reviews, ...reviews];
  const track = [...base, ...base];
  const anim = direction === "forward" ? "animate-marquee-slow" : "animate-marquee-slow-rev";

  return (
    <div className={`flex w-max gap-6 ${anim}`}>
      {track.map((r, i) => (
        <ReviewCard key={i} review={r} />
      ))}
    </div>
  );
}

function ReviewCard({ review: r }: { review: Review }) {
  return (
    <figure className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-[rgba(230,205,139,0.25)] bg-[rgba(255,255,255,0.04)] p-7 sm:w-[360px]">
      <Stars rating={r.rating} />
      <blockquote className="mt-4 flex-1 font-serif text-lg italic leading-relaxed text-cream/90">
        “{r.text}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-[rgba(230,205,139,0.18)] pt-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-hi to-gold-deep font-serif text-lg font-bold text-maroon">
          {r.name.charAt(0)}
        </span>
        <span>
          <span className="block font-medium text-cream">{r.name}</span>
          <span className="flex items-center gap-1 text-xs text-cream/60">
            {r.place}
            <VerifiedIcon />
            Verified buyer
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? "var(--color-gold)" : "rgba(230,205,139,0.25)"}
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
        </svg>
      ))}
    </div>
  );
}

function VerifiedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" className="ml-1 text-gold" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l2.4 1.8 3 .2.9 2.9 2.3 1.9-1 2.8 1 2.8-2.3 1.9-.9 2.9-3 .2L12 22l-2.4-1.8-3-.2-.9-2.9L3.4 15l1-2.8-1-2.8 2.3-1.9.9-2.9 3-.2z"
      />
      <path fill="var(--color-maroon)" d="M10.5 14.2l-2-2 1-1 1 1 3-3 1 1z" />
    </svg>
  );
}
