"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/email";
import { randomBytes } from "node:crypto";
import {
  PIECE_TYPES,
  FINISHES,
  BUDGETS,
  MAX_REFERENCE_PHOTOS,
  MAX_REFERENCE_BYTES,
  REFERENCE_PHOTOS_HEADING,
} from "@/lib/custom-request";
import { saveUpload, sniffImage, type ImageExt } from "@/lib/uploads";

export type InboundState = { ok?: boolean; error?: string; values?: Record<string, string> };

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Please write a short message").max(5000),
  topic: z.string().trim().max(80).optional(),
});

// Contact form → saved for the admin (Messages page) + best-effort email alert.
export async function sendContactMessage(prev: InboundState, formData: FormData): Promise<InboundState> {
  const res = await saveContact(prev, formData);
  if (res.ok) return res;
  // Keep what they typed after an error (React 19 resets the form).
  const values = Object.fromEntries(
    ["name", "email", "phone", "subject", "message"].map((k) => [k, String(formData.get(k) ?? "")])
  );
  return { ...res, values };
}

async function saveContact(_prev: InboundState, formData: FormData): Promise<InboundState> {
  // Honeypot: real users never fill this hidden field.
  if (String(formData.get("website") ?? "")) return { ok: true };
  if (!rateLimit(`contact:${await clientIp()}`, 5, 30 * 60_000)) return { error: TOO_MANY };

  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message") ?? "",
    topic: formData.get("topic") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email.toLowerCase(),
        phone: d.phone || null,
        subject: d.subject || null,
        message: d.message,
        topic: d.topic || null,
      },
    });
  } catch (err) {
    console.error("[contact] could not save message:", err);
    return { error: "We couldn't send your message right now. Please try again shortly." };
  }

  await sendContactNotification(d);
  return { ok: true };
}

// ---------- Custom design request (Custom page) ----------
// Saved as a ContactMessage with topic "custom" so it shows in Admin → Messages.

const customSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().min(7, "Enter a phone / WhatsApp number so we can discuss your design").max(30),
  pieceType: z.enum(PIECE_TYPES, { message: "Choose what you'd like us to make" }),
  finish: z.enum(FINISHES, { message: "Choose a finish" }),
  budget: z.enum(BUDGETS, { message: "Choose a budget" }),
  neededBy: z.string().trim().max(60).optional(),
  details: z.string().trim().min(10, "Tell us a little about your design (at least a sentence)").max(3000),
});

const CUSTOM_FIELDS = ["name", "email", "phone", "pieceType", "finish", "budget", "neededBy", "details"];

export async function sendCustomRequest(_prev: InboundState, formData: FormData): Promise<InboundState> {
  const values = Object.fromEntries(CUSTOM_FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  if (String(formData.get("website") ?? "")) return { ok: true }; // honeypot
  if (!rateLimit(`custom:${await clientIp()}`, 5, 30 * 60_000)) return { error: TOO_MANY, values };

  const parsed = customSchema.safeParse({ ...values, neededBy: values.neededBy || undefined });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };
  const d = parsed.data;

  // Optional reference photos: real type from the bytes, never the client's word.
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_REFERENCE_PHOTOS) {
    return { error: `Please attach up to ${MAX_REFERENCE_PHOTOS} photos.`, values };
  }
  const images: { bytes: Buffer; ext: ImageExt }[] = [];
  for (const file of files) {
    if (file.size > MAX_REFERENCE_BYTES) return { error: "Each photo must be under 3 MB.", values };
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = sniffImage(bytes);
    if (!ext) return { error: "Photos must be JPG, PNG, WEBP or AVIF images.", values };
    images.push({ bytes, ext });
  }
  const photoUrls: string[] = [];
  try {
    for (const img of images) {
      const filename = `ref-${randomBytes(6).toString("hex")}-${Date.now()}.${img.ext}`;
      photoUrls.push(await saveUpload(filename, img.bytes, img.ext, "references"));
    }
  } catch (err) {
    console.error("[custom] could not save reference photos:", err);
    return { error: "We couldn't upload your photos right now. Please try again, or send them on WhatsApp.", values };
  }

  const subject = `Custom design: ${d.pieceType}`;
  const message = [
    `Piece: ${d.pieceType}`,
    `Finish: ${d.finish}`,
    `Budget: ${d.budget}`,
    `Needed by: ${d.neededBy || "Flexible"}`,
    "",
    d.details,
    ...(photoUrls.length ? ["", REFERENCE_PHOTOS_HEADING, ...photoUrls] : []),
  ].join("\n");

  try {
    await prisma.contactMessage.create({
      data: { name: d.name, email: d.email.toLowerCase(), phone: d.phone, subject, message, topic: "custom" },
    });
  } catch (err) {
    console.error("[custom] could not save request:", err);
    return { error: "We couldn't send your request right now. Please try again shortly.", values };
  }

  await sendContactNotification({ name: d.name, email: d.email, phone: d.phone, subject, message, topic: "custom" });
  return { ok: true };
}

// Newsletter / "notify me" sign-up. Idempotent per email.
export async function subscribe(_prev: InboundState, formData: FormData): Promise<InboundState> {
  if (String(formData.get("website") ?? "")) return { ok: true };
  if (!rateLimit(`subscribe:${await clientIp()}`, 10, 30 * 60_000)) return { error: TOO_MANY };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().max(200).safeParse(email).success) {
    return { error: "Please enter a valid email address." };
  }
  const source = String(formData.get("source") ?? "newsletter").slice(0, 80) || "newsletter";

  try {
    await prisma.subscriber.upsert({
      where: { email },
      create: { email, source },
      update: {},
    });
  } catch (err) {
    console.error("[newsletter] could not save subscriber:", err);
    return { error: "We couldn't sign you up right now. Please try again shortly." };
  }
  return { ok: true };
}
