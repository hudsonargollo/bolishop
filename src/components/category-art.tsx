// Elegant gold line-art illustrations for category tiles (until real photos).

type Props = { className?: string };

function Necklace({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M22 34 C 40 78, 80 78, 98 34" strokeLinecap="round" />
      <path d="M60 76 v10" strokeLinecap="round" />
      <path d="M60 86 l7 10 -7 10 -7 -10 z" fill="currentColor" stroke="none" />
      <circle cx="22" cy="34" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="98" cy="34" r="2.5" fill="currentColor" stroke="none" />
      {[30, 42, 54, 66, 78, 90].map((x, i) => (
        <circle key={i} cx={x} cy={i < 3 ? 44 + i * 8 : 44 + (5 - i) * 8} r="1.4" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

function Ring({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <circle cx="60" cy="74" r="28" />
      <circle cx="60" cy="74" r="22" strokeWidth="1" opacity="0.5" />
      <path d="M60 30 l10 12 -10 12 -10 -12 z" fill="currentColor" stroke="none" />
      <path d="M50 42 h20" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function Earrings({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      {[42, 78].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 26 a10 10 0 0 1 0 20`} strokeLinecap="round" />
          <circle cx={x} cy={50} r="3" fill="currentColor" stroke="none" />
          <path d={`M${x} 56 l9 16 -9 18 -9 -18 z`} />
          <circle cx={x} cy={74} r="3.5" fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

function Bracelet({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <ellipse cx="60" cy="62" rx="40" ry="30" />
      <ellipse cx="60" cy="62" rx="34" ry="24" strokeWidth="1" opacity="0.5" />
      <path d="M60 30 l7 9 -7 9 -7 -9 z" fill="currentColor" stroke="none" />
      {[30, 60, 90].map((x, i) => (
        <circle key={i} cx={x} cy={i === 1 ? 92 : 78} r="2" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

const MAP: Record<string, (p: Props) => React.ReactElement> = {
  necklaces: Necklace,
  rings: Ring,
  earrings: Earrings,
  bracelets: Bracelet,
};

export function CategoryArt({ slug, className }: { slug: string; className?: string }) {
  const Art = MAP[slug] ?? Necklace;
  return <Art className={className} />;
}
