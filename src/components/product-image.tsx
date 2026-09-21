/* eslint-disable @next/next/no-img-element */

// Renders a product image, or an elegant branded placeholder when no image
// is available yet (before real product photography is added).

const GRADIENTS = [
  "linear-gradient(135deg, #f3e7d3, #e6d2b0)",
  "linear-gradient(135deg, #efe0e4, #e2c9cf)",
  "linear-gradient(135deg, #e9e3d6, #d8ccb4)",
  "linear-gradient(135deg, #f1e6d8, #e7cfb6)",
];

function pickGradient(seed: string): string {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return GRADIENTS[sum % GRADIENTS.length];
}

export function ProductImage({
  src,
  alt,
  seed,
  className = "",
}: {
  src?: string;
  alt: string;
  seed: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{ background: pickGradient(seed) }}
      role="img"
      aria-label={alt}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" opacity="0.55">
        <path
          d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"
          fill="#b98b36"
        />
      </svg>
    </div>
  );
}
