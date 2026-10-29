import { NextRequest, NextResponse } from "next/server";
import { createOrder, cancelOrderAndRestock } from "@/lib/orders";
import { initiatePayment, isOnlineConfigured, type PaymentMethod } from "@/lib/payments";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site";
import { getTenant } from "@/lib/tenant";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  if (!rateLimit(`order:${await clientIp()}`, 10, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: TOO_MANY }, { status: 429 });
  }

  const { tenant: tenantSlug } = await params;
  const tenant = await getTenant(tenantSlug);
  if (!tenant) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });

  let body: { [k: string]: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = body as any;
  const method: PaymentMethod = input?.paymentMethod;

  // Never take an "online" order we can't actually charge — it would look
  // confirmed to the shopper while no payment is ever collected.
  if ((method === "PAYFAST" || method === "SAFEPAY") && !isOnlineConfigured(method)) {
    return NextResponse.json(
      { ok: false, error: "Online payment isn't available yet. Please choose Cash on Delivery." },
      { status: 400 }
    );
  }

  // Orders are for signed-in customers only (the checkout page redirects guests;
  // this stops direct API calls). A cookie for a deleted account doesn't count.
  const session = await getCustomerSession();
  const customer = session
    ? await prisma.customer
        .findUnique({ where: { tenantId: tenant.id, id: session.id }, select: { id: true, email: true } })
        .catch(() => null)
    : null;
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to place your order.", signIn: true },
      { status: 401 }
    );
  }

  // The order belongs to the account, so its emails go to the account's address.
  const result = await createOrder(tenant.id, { ...input, email: customer.email }, customer.id);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  if (method === "PAYFAST" || method === "SAFEPAY") {
    const order = encodeURIComponent(result.orderNumber);
    // Callbacks are scoped to this tenant so the gateway's notify/buyer
    // redirect lands in the store's own routes (and resolves the right tenant).
    const payfastCallback = `${siteUrl}/${tenant.slug}/api/payments/payfast/callback`;
    const payment = await initiatePayment(method, {
      orderNumber: result.orderNumber,
      amount: result.total,
      customer: {
        name: String(input.customerName ?? ""),
        email: String(input.email ?? ""),
        phone: String(input.phone ?? ""),
      },
      returnUrl:
        method === "PAYFAST"
          ? payfastCallback
          : `${siteUrl}/${tenant.slug}/checkout/success?order=${order}`,
      cancelUrl:
        method === "PAYFAST"
          ? payfastCallback
          : `${siteUrl}/${tenant.slug}/api/payments/cancel?order=${order}`,
      notifyUrl:
        method === "PAYFAST"
          ? payfastCallback
          : `${siteUrl}/${tenant.slug}/api/payments/safepay/webhook`,
    });

    if (payment.configured && payment.ok) {
      if (payment.reference) {
        await prisma.order
          .update({ where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber: result.orderNumber } }, data: { paymentRef: payment.reference } })
          .catch((err) => console.error("[order] could not save payment reference:", err));
      }
      return NextResponse.json(
        { ...result, redirectUrl: payment.redirectUrl },
        { status: 201 }
      );
    }

    // Gateway unreachable/rejected: release the stock and tell the shopper.
    console.error("[order] payment initiation failed:", payment.configured ? payment.error : "not configured");
    const placed = await prisma.order.findUnique({
      where: { tenantId_orderNumber: { tenantId: tenant.id, orderNumber: result.orderNumber } },
      select: { id: true },
    });
    if (placed) {
      await prisma.order.update({ where: { id: placed.id }, data: { paymentStatus: "FAILED" } });
      await cancelOrderAndRestock(tenant.id, placed.id);
    }
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't connect to the payment provider. Please try again or choose Cash on Delivery.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(result, { status: 201 });
}
