import path from "node:path";

// Admin-uploaded product images live OUTSIDE `public/`: a production server
// (`next start` / standalone) only serves files that were in `public/` at build
// time. They're stored in UPLOAD_DIR (default `<project>/uploads`) and served by
// the `/uploads/products/[file]` route. Mount this folder as a persistent volume
// in Docker so images survive redeploys.
export const UPLOAD_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads")
);
export const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_ROOT, "products");

export const IMAGE_TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;

export type ImageExt = keyof typeof IMAGE_TYPES;

// Identify an image by its magic bytes — never trust the client's MIME type
// or file extension.
export function sniffImage(buf: Buffer): ImageExt | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(buf.toString("ascii", 8, 12))) return "avif";
  return null;
}

// Only names this app generates: lowercase slug + timestamp + known extension.
export const SAFE_UPLOAD_NAME = /^[a-z0-9-]{1,80}\.(jpg|png|webp|avif)$/;
