import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelOrderAndRestock } from "@/lib/orders";
import { siteUrl } from "@/lib/site";
import { getTenant } from "@/lib/tenant";

// The gateway sends the shopper here when they abandon/cancel payment.
// Releases the reserved stock of that still-unpaid online order so a retry
// doesn't leave a duplicate pending order behind. Only recent, unpaid,
// online orders can be cancelled this way (order numbers are unguessable).
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const orderNumber = new URL(request.url).searchParams.get("order")?.trim() ?? "";
  const tenant = await getTenant(tenantSlug);

  if (tenant && orderNumber) {
    try {
      const o = await prisma.order.findUnique({
        where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber } },
        select: { id: true, paymentMethod: true, paymentStatus: true, status: true, createdAt: true },
      });
      if (
        o &&
        o.paymentMethod !== "COD" &&
        o.paymentStatus === "PENDING" &&
        o.status === "PENDING" &&
        Date.now() - o.createdAt.getTime() < MAX_AGE_MS
      ) {
        await prisma.order.updateMany({
          where: { id: o.id, paymentStatus: "PENDING" },
          data: { paymentStatus: "FAILED" },
        });
        await cancelOrderAndRestock(tenant.id, o.id);
      }
    } catch (err) {
      console.error("[payment] cancel handling failed:", err);
    }
  }
  // Back into this store's checkout with the "cancelled" notice.
  return NextResponse.redirect(`${siteUrl}/${tenantSlug}/checkout?payment=cancelled`, { status: 303 });
}
