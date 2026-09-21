import { NextResponse } from "next/server";
import { markOrderPayment } from "@/lib/order-payment";

// PayFast redirects / notifies here after a payment attempt.
// PayFast posts form-encoded fields incl. basket_id and err_code ("000" = ok).
//
// TODO (with live credentials): verify the response signature/validation hash
// against PAYFAST_SECURED_KEY before trusting err_code.
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  let orderNumber = "";
  let success = false;

  try {
    const form = await request.formData();
    orderNumber = String(form.get("basket_id") ?? form.get("BASKET_ID") ?? "");
    const err = String(form.get("err_code") ?? form.get("ERR_CODE") ?? "");
    success = err === "000" || err === "00" || err.toLowerCase() === "success";
  } catch {
    // ignore malformed callback
  }

  if (orderNumber) await markOrderPayment(orderNumber, success);

  const target = success
    ? `/checkout/success?order=${encodeURIComponent(orderNumber)}`
    : `/checkout?payment=failed`;
  return NextResponse.redirect(`${origin}${target}`, { status: 303 });
}
