// ZARIERA lotus emblem — matches the client's approved logo mark:
// a top diamond sparkle, a central petal with an inner sparkle, and two
// outward-sweeping side petals. Petals inherit the theme color (gold);
// the diamonds are white (with a hairline gold outline so they stay
// visible on light backgrounds too).

export function Emblem({
  size = 44,
  className = "",
  color = "currentColor",
  diamond = "#ffffff",
}: {
  size?: number;
  className?: string;
  color?: string;
  diamond?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 66) / 64}
      viewBox="0 0 64 66"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* side petals */}
      <path d="M32 53 C 19 52, 11 41, 13.5 29 C 21 36, 28 46, 32 53 Z" />
      <path d="M32 53 C 45 52, 53 41, 50.5 29 C 43 36, 36 46, 32 53 Z" />

      {/* central petal */}
      <path d="M32 17 C 25 25, 25 46, 32 53 C 39 46, 39 25, 32 17 Z" />

      {/* top diamond */}
      <path
        d="M32 2 L33.6 6.4 L38 8 L33.6 9.6 L32 14 L30.4 9.6 L26 8 L30.4 6.4 Z"
        fill={diamond}
        stroke={color}
        strokeWidth="0.8"
      />

      {/* inner diamond */}
      <path
        d="M32 30 L33.1 33 L36 34 L33.1 35 L32 38 L30.9 35 L28 34 L30.9 33 Z"
        fill={diamond}
        stroke={color}
        strokeWidth="0.7"
      />
    </svg>
  );
}
