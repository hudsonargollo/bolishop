import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getVerifiedAdmin } from "@/lib/admin";
import { PRODUCT_UPLOAD_DIR, sniffImage } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  // Admin only
  const session = await getVerifiedAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Image is too large (max 5 MB)." },
      { status: 400 }
    );
  }

  // The real type comes from the file's bytes; the extension is derived from it.
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Only JPG, PNG, WEBP or AVIF images are allowed." },
      { status: 400 }
    );
  }

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  const filename = `${base}-${Date.now()}.${ext}`;

  try {
    await mkdir(PRODUCT_UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(PRODUCT_UPLOAD_DIR, filename), bytes);
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save the image." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/uploads/products/${filename}` }, { status: 201 });
}
