import { NextResponse } from "next/server";
import { markOrderPayment } from "@/lib/order-payment";

// Safepay server-to-server webhook. Safepay POSTs a JSON event when a payment
// completes; the payload carries the tracker and your order reference.
//
// TODO (with live credentials): verify the webhook signature using
// SAFEPAY_WEBHOOK_SECRET before trusting the event.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      data?: {
        order_id?: string;
        reference?: string;
        state?: string;
        status?: string;
      };
      type?: string;
    };

    const orderNumber = body.data?.order_id ?? body.data?.reference ?? "";
    const state = (body.data?.state ?? body.data?.status ?? "").toLowerCase();
    const paid =
      body.type === "payment:created" ||
      state === "paid" ||
      state === "completed" ||
      state === "tracker_ended";

    if (orderNumber) await markOrderPayment(orderNumber, paid);
  } catch {
    // ignore malformed webhook
  }

  return NextResponse.json({ received: true });
}
