import { cache } from "react";
import { prisma } from "./prisma";
import { CONTACT } from "./contact";
import { FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD, DELIVERY_TIME } from "./shipping";
import type { StoreSettings } from "./settings-shared";

export type { StoreSettings } from "./settings-shared";

// Store settings live in the DB (Setting key "store") and are edited in
// Admin → Settings. Anything never saved falls back to the env-based defaults
// below, so a fresh install / an unreachable DB still renders correctly.

const KEY = "store";

export const DEFAULT_SETTINGS: StoreSettings = {
  contact: {
    email: CONTACT.email,
    phone: CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
    city: CONTACT.city,
    hours: CONTACT.hours,
  },
  social: {
    instagram: CONTACT.instagram,
    facebook: CONTACT.facebook,
    tiktok: CONTACT.tiktok,
  },
  shipping: {
    flatFee: FLAT_SHIPPING,
    freeThreshold: FREE_SHIPPING_THRESHOLD,
    deliveryTime: DELIVERY_TIME,
  },
  announcements: [
    `Free shipping on orders over {freeThreshold}`,
    "Cash on Delivery available nationwide",
    "Premium stainless steel — rust-free & hypoallergenic",
    "Complimentary care guidance with every order",
    "Secure checkout",
  ],
  inventory: { lowStockThreshold: 5 },
  notifications: { orderEmail: process.env.ADMIN_NOTIFY_EMAIL || "" },
};

type Partialish = { [K in keyof StoreSettings]?: Partial<StoreSettings[K]> | StoreSettings[K] };

function merge(saved: Partialish | null | undefined): StoreSettings {
  const s = saved ?? {};
  return {
    contact: { ...DEFAULT_SETTINGS.contact, ...(s.contact as object) },
    social: { ...DEFAULT_SETTINGS.social, ...(s.social as object) },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...(s.shipping as object) },
    announcements: Array.isArray(s.announcements) ? (s.announcements as string[]) : DEFAULT_SETTINGS.announcements,
    inventory: { ...DEFAULT_SETTINGS.inventory, ...(s.inventory as object) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s.notifications as object) },
  };
}

/** Current store settings (cached per request). Never throws. */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    return merge(row?.value as Partialish | undefined);
  } catch {
    return DEFAULT_SETTINGS;
  }
});

/** Saves one section of the settings (merged over what's stored). */
export async function saveStoreSettings<K extends keyof StoreSettings>(
  section: K,
  value: StoreSettings[K]
): Promise<void> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const current = (row?.value as Partialish | undefined) ?? {};
  const next = { ...current, [section]: value };
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next as object },
    update: { value: next as object },
  });
}

/** Announcement lines with placeholders filled in ({freeThreshold}, {flatFee}). */
export function renderAnnouncements(s: StoreSettings): string[] {
  const fmt = (n: number) => `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n)}`;
  return s.announcements
    .map((line) =>
      line
        .replaceAll("{freeThreshold}", fmt(s.shipping.freeThreshold))
        .replaceAll("{flatFee}", fmt(s.shipping.flatFee))
        .trim()
    )
    .filter(Boolean);
}
