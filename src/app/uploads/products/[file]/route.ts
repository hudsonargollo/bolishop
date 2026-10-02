import { readFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_TYPES, PRODUCT_UPLOAD_DIR, SAFE_UPLOAD_NAME, type ImageExt } from "@/lib/uploads";

export const runtime = "nodejs";

// Serves admin-uploaded product images from UPLOAD_DIR (see lib/uploads.ts).
export async function GET(_request: Request, ctx: RouteContext<"/uploads/products/[file]">) {
  const { file } = await ctx.params;
  if (!SAFE_UPLOAD_NAME.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(PRODUCT_UPLOAD_DIR, file));
    const ext = file.split(".").pop() as ImageExt;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": IMAGE_TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
