// Payment gateway integration — PayFast (Pakistan) & Safepay.
//
// Both require a merchant account (arranged by the client). Until the relevant
// env vars are set, `configured` is false and checkout falls back to placing a
// pending order (preview mode). Once credentials are added, the online methods
// initiate a real gateway redirect.
//
// NOTE: Endpoint URLs and field names follow each gateway's public docs and may
// need small adjustments to match the client's specific account / API version.
// Always verify callbacks server-side (signature/status) before marking PAID.

export type PaymentMethod = "COD" | "PAYFAST" | "SAFEPAY";

export type PaymentInitInput = {
  orderNumber: string;
  amount: number; // PKR
  customer: { name: string; email: string; phone: string };
  returnUrl: string; // where the gateway sends the buyer back
  cancelUrl: string;
};

export type PaymentInitResult =
  | { configured: false }
  | { configured: true; ok: true; redirectUrl: string }
  | { configured: true; ok: false; error: string };

// ---------- Config ----------

export function payfastConfigured(): boolean {
  return Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_SECURED_KEY);
}

export function safepayConfigured(): boolean {
  return Boolean(process.env.SAFEPAY_API_KEY);
}

export function isOnlineConfigured(method: PaymentMethod): boolean {
  if (method === "PAYFAST") return payfastConfigured();
  if (method === "SAFEPAY") return safepayConfigured();
  return false;
}

// ---------- PayFast ----------

async function initiatePayfast(input: PaymentInitInput): Promise<PaymentInitResult> {
  if (!payfastConfigured()) return { configured: false };

  const sandbox = process.env.PAYFAST_SANDBOX !== "false";
  const base = sandbox
    ? "https://ipguat.apps.net.pk/Ecommerce/api/Transaction"
    : "https://ipg1.apps.net.pk/Ecommerce/api/Transaction";

  try {
    // 1) Get an access token
    const tokenBody = new URLSearchParams({
      MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID!,
      SECURED_KEY: process.env.PAYFAST_SECURED_KEY!,
      BASKET_ID: input.orderNumber,
      TXNAMT: input.amount.toFixed(2),
      CURRENCY_CODE: "PKR",
    });
    const tokenRes = await fetch(`${base}/GetAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody,
    });
    const tokenJson = (await tokenRes.json()) as { ACCESS_TOKEN?: string };
    const token = tokenJson.ACCESS_TOKEN;
    if (!token) return { configured: true, ok: false, error: "PayFast token error" };

    // 2) Build the hosted-checkout redirect (buyer completes payment there)
    const params = new URLSearchParams({
      MERCHANT_ID: process.env.PAYFAST_MERCHANT_ID!,
      MERCHANT_NAME: "ZARIERA",
      TOKEN: token,
      PROCCODE: "00",
      TXNAMT: input.amount.toFixed(2),
      CUSTOMER_MOBILE_NO: input.customer.phone,
      CUSTOMER_EMAIL_ADDRESS: input.customer.email,
      SIGNATURE: input.orderNumber,
      VERSION: "ZARIERA-1.0",
      TXNDESC: `ZARIERA order ${input.orderNumber}`,
      SUCCESS_URL: input.returnUrl,
      FAILURE_URL: input.cancelUrl,
      BASKET_ID: input.orderNumber,
      ORDER_DATE: new Date().toISOString(),
      CURRENCY_CODE: "PKR",
    });
    return {
      configured: true,
      ok: true,
      redirectUrl: `${base}/PostTransaction?${params.toString()}`,
    };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      error: err instanceof Error ? err.message : "PayFast error",
    };
  }
}

// ---------- Safepay ----------

async function initiateSafepay(input: PaymentInitInput): Promise<PaymentInitResult> {
  if (!safepayConfigured()) return { configured: false };

  const sandbox = process.env.SAFEPAY_SANDBOX !== "false";
  const apiBase = sandbox
    ? "https://sandbox.api.getsafepay.com"
    : "https://api.getsafepay.com";
  const environment = sandbox ? "sandbox" : "production";

  try {
    // 1) Initialize an order — returns a tracker token
    const initRes = await fetch(`${apiBase}/order/v1/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: process.env.SAFEPAY_API_KEY,
        amount: input.amount,
        currency: "PKR",
        environment,
      }),
    });
    const initJson = (await initRes.json()) as { data?: { token?: string } };
    const token = initJson.data?.token;
    if (!token) return { configured: true, ok: false, error: "Safepay init error" };

    // 2) Redirect the buyer to Safepay's hosted checkout
    const params = new URLSearchParams({
      beacon: token,
      env: environment,
      source: "custom",
      order_id: input.orderNumber,
      redirect_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    });
    return {
      configured: true,
      ok: true,
      redirectUrl: `${apiBase}/checkout/pay?${params.toString()}`,
    };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      error: err instanceof Error ? err.message : "Safepay error",
    };
  }
}

// ---------- Dispatch ----------

export async function initiatePayment(
  method: PaymentMethod,
  input: PaymentInitInput
): Promise<PaymentInitResult> {
  if (method === "PAYFAST") return initiatePayfast(input);
  if (method === "SAFEPAY") return initiateSafepay(input);
  return { configured: false }; // COD needs no gateway
}
