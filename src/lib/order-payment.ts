import { prisma } from "./prisma";

// Updates an order's payment/status by its order number (used by gateway
// callbacks). No-ops gracefully if the database isn't connected.
export async function markOrderPayment(
  orderNumber: string,
  paid: boolean
): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { orderNumber },
      data: paid
        ? { paymentStatus: "PAID", status: "CONFIRMED" }
        : { paymentStatus: "FAILED" },
    });
    return true;
  } catch {
    return false;
  }
}
