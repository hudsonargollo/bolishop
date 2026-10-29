"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getDefaultTenantId } from "@/lib/tenant";
import { bookShipment, isCourier } from "@/lib/couriers";
import { cancelOrderAndRestock } from "@/lib/orders";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  canMoveOrder,
  canMovePayment,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";

export type ShipState = { error?: string; ok?: boolean; simulated?: boolean };

export async function bookShipmentAction(
  id: string,
  _prev: ShipState,
  formData: FormData
): Promise<ShipState> {
  await requireAdmin();
  const tenantId = (await getDefaultTenantId()) ?? "";
  const courier = String(formData.get("courier") || "");
  if (!isCourier(courier)) return { error: "Please choose a courier." };

  let order;
  try {
    order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: { items: { select: { quantity: true } } },
    });
  } catch {
    return { error: "Database unavailable. Please try again." };
  }
  if (!order) return { error: "Order not found." };
  if (order.trackingNumber) return { error: "This order is already booked with a courier." };
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return { error: `A ${order.status.toLowerCase()} order can't be shipped.` };
  }
  if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") {
    return { error: "This online order hasn't been paid yet." };
  }

  // Claim the order first (atomic) so a double-click or a second admin can't
  // book the same parcel twice. Released again if the booking fails.
  const claim = await prisma.order.updateMany({
    where: { id, tenantId, trackingNumber: null, courier: null },
    data: { courier },
  });
  if (claim.count !== 1) return { error: "This order is already being booked." };

  const release = () =>
    prisma.order
      .updateMany({ where: { id, tenantId, trackingNumber: null }, data: { courier: null } })
      .catch(() => undefined);

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const result = await bookShipment(
    {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      itemCount,
    },
    courier
  );

  if (!result.ok) {
    await release();
    return { error: result.error };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: {
        courier,
        trackingNumber: result.trackingNumber,
        shippedAt: new Date(),
        status: "SHIPPED",
      },
    });
  } catch {
    console.error(`[courier] booked ${courier} ${result.trackingNumber} for ${order.orderNumber} but could not save it`);
    return { error: `Booked (tracking ${result.trackingNumber}) but could not save. Note this number and retry.` };
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true, simulated: result.simulated };
}

export type StatusState = { ok?: boolean; error?: string };

export async function updateOrderStatus(
  id: string,
  _prev: StatusState,
  formData: FormData
): Promise<StatusState> {
  await requireAdmin();
  const tenantId = (await getDefaultTenantId()) ?? "";
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid status." };
  try {
    const order = await prisma.order.findFirst({ where: { id, tenantId }, select: { status: true } });
    if (!order) return { error: "Order not found." };
    if (order.status === status) return { ok: true };
    if (!canMoveOrder(order.status, status)) {
      return { error: `Can't change a ${order.status.toLowerCase()} order to ${status.toLowerCase()}.` };
    }
    if (status === "CANCELLED") {
      // Cancelling returns the items to stock (exactly once).
      await cancelOrderAndRestock(tenantId, id);
    } else {
      // Conditional on the status we validated against (no lost updates).
      const res = await prisma.order.updateMany({ where: { id, tenantId, status: order.status }, data: { status } });
      if (res.count !== 1) return { error: "The order changed meanwhile. Reload and try again." };
    }
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch {
    return { error: "Could not update. Database unavailable." };
  }
}

export async function updatePaymentStatus(
  id: string,
  _prev: StatusState,
  formData: FormData
): Promise<StatusState> {
  await requireAdmin();
  const tenantId = (await getDefaultTenantId()) ?? "";
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  if (!PAYMENT_STATUSES.includes(paymentStatus)) return { error: "Invalid payment status." };
  try {
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      select: { paymentStatus: true },
    });
    if (!order) return { error: "Order not found." };
    if (order.paymentStatus === paymentStatus) return { ok: true };
    if (!canMovePayment(order.paymentStatus, paymentStatus)) {
      return {
        error: `Can't change payment from ${order.paymentStatus.toLowerCase()} to ${paymentStatus.toLowerCase()}.`,
      };
    }
    const res = await prisma.order.updateMany({
      where: { id, tenantId, paymentStatus: order.paymentStatus },
      data: { paymentStatus },
    });
    if (res.count !== 1) return { error: "The order changed meanwhile. Reload and try again." };
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch {
    return { error: "Could not update. Database unavailable." };
  }
}
