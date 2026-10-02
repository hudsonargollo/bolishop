"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/email";

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
