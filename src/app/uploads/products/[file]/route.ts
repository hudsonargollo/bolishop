import { IMAGE_TYPES, SAFE_UPLOAD_NAME, readUpload, type ImageExt } from "@/lib/uploads";

export const runtime = "nodejs";

// Serves admin-uploaded product images from UPLOAD_DIR (see lib/uploads.ts).
export async function GET(_request: Request, ctx: RouteContext<"/uploads/products/[file]">) {
  const { file } = await ctx.params;
  if (!SAFE_UPLOAD_NAME.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readUpload(file);
    if (!data) return new Response("Not found", { status: 404 });
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
