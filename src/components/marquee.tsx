// Continuous scrolling announcement strip (pure CSS, pauses on hover).
// Lines are edited in Admin → Settings → Announcement bar.

export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  // Rendered twice back-to-back so the -50% translate loops seamlessly.
  const strip = [...items, ...items];

  return (
    <div
      className="marquee-pause relative overflow-hidden border-y border-[rgba(230,205,139,0.28)] py-2.5 text-light"
      style={{ background: "linear-gradient(90deg, #3d1019 0%, #5b1a2b 50%, #3d1019 100%)" }}
    >
      {/* soft gold glow edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16"
        style={{ background: "linear-gradient(90deg, #3d1019, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16"
        style={{ background: "linear-gradient(270deg, #3d1019, transparent)" }}
      />

      <div className="flex w-max animate-marquee items-center whitespace-nowrap">
        {strip.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-7 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-light/90">
              {t}
            </span>
            {/* gold diamond separator */}
            <span className="h-1.5 w-1.5 rotate-45 bg-gold-hi/70" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
