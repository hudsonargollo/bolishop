"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";

export async function updateOrderStatus(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return;
  try {
    await prisma.order.update({ where: { id }, data: { status } });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
  } catch {
    /* DB unavailable */
  }
}

export async function updatePaymentStatus(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  if (!PAYMENT_STATUSES.includes(paymentStatus)) return;
  try {
    await prisma.order.update({ where: { id }, data: { paymentStatus } });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
  } catch {
    /* DB unavailable */
  }
}
