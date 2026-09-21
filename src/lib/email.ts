import nodemailer from "nodemailer";
import { formatPrice } from "./format";

// Transactional email via SMTP. Works with any provider (Gmail, your web-host
// mailbox, Brevo/SendinBlue, Mailgun SMTP, etc.). Until SMTP env vars are set,
// emails are skipped gracefully (checkout still succeeds).

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function itemsTable(o: OrderEmailData): string {
  const rows = o.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eadfce;color:#3a231e">
          ${escape(i.name)} <span style="color:#8a6f63">× ${i.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eadfce;text-align:right;color:#3a231e">
          ${formatPrice(i.price * i.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows}
      <tr><td style="padding:8px 0;color:#8a6f63">Subtotal</td><td style="padding:8px 0;text-align:right;color:#3a231e">${formatPrice(o.subtotal)}</td></tr>
      <tr><td style="padding:8px 0;color:#8a6f63">Shipping</td><td style="padding:8px 0;text-align:right;color:#3a231e">${o.shipping === 0 ? "Free" : formatPrice(o.shipping)}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:700;color:#3a231e">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#3a231e">${formatPrice(o.total)}</td></tr>
    </table>`;
}

function shell(title: string, inner: string): string {
  return `
  <div style="background:#f4e8d5;padding:24px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fffaf2;border:1px solid #eadfce;border-radius:12px;overflow:hidden">
      <div style="background:#5b1a2b;padding:22px;text-align:center">
        <div style="color:#e6cd8b;font-size:24px;letter-spacing:6px;font-weight:700">ZARIERA</div>
        <div style="color:#dcc6ad;font-style:italic;font-size:13px;margin-top:4px">Every Jewel Tells a Story</div>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 8px;color:#3a231e;font-size:22px">${title}</h1>
        ${inner}
      </div>
      <div style="background:#5b1a2b;padding:16px;text-align:center;color:#dcc6ad;font-size:12px">
        Premium Stainless Steel Jewelry · Made to last
      </div>
    </div>
  </div>`;
}

function customerHtml(o: OrderEmailData): string {
  return shell(
    "Thank you for your order!",
    `<p style="color:#3a231e;font-size:14px">Hi ${escape(o.customerName)}, we&rsquo;ve received your order and our team will be in touch shortly.</p>
     <p style="color:#3a231e;font-size:14px">Order number: <strong>${escape(o.orderNumber)}</strong><br/>
     Payment: <strong>${escape(o.paymentMethod)}</strong></p>
     <div style="margin:18px 0">${itemsTable(o)}</div>
     <p style="color:#8a6f63;font-size:13px">Delivery to: ${escape(o.address)}, ${escape(o.city)}<br/>Phone: ${escape(o.phone)}</p>
     ${o.paymentMethod === "COD" ? `<p style="color:#8a6f63;font-size:13px">For Cash on Delivery, please keep the amount ready at delivery.</p>` : ""}`
  );
}

function adminHtml(o: OrderEmailData): string {
  return shell(
    "New order received",
    `<p style="color:#3a231e;font-size:14px">Order <strong>${escape(o.orderNumber)}</strong> — ${formatPrice(o.total)} (${escape(o.paymentMethod)})</p>
     <p style="color:#3a231e;font-size:14px"><strong>${escape(o.customerName)}</strong><br/>
     ${escape(o.email)} · ${escape(o.phone)}<br/>
     ${escape(o.address)}, ${escape(o.city)}</p>
     <div style="margin:18px 0">${itemsTable(o)}</div>`
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Sends confirmation to the customer + notification to the store owner.
// Never throws — email failures must not break checkout.
export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  if (!emailConfigured()) {
    console.warn("[email] SMTP not configured — skipping order emails.");
    return;
  }

  const from = process.env.MAIL_FROM || `ZARIERA <${process.env.SMTP_USER}>`;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER!;

  try {
    const transport = getTransport();
    await Promise.all([
      transport.sendMail({
        from,
        to: o.email,
        subject: `Your ZARIERA order ${o.orderNumber}`,
        html: customerHtml(o),
      }),
      transport.sendMail({
        from,
        to: adminTo,
        subject: `New order ${o.orderNumber} — ${formatPrice(o.total)}`,
        html: adminHtml(o),
      }),
    ]);
  } catch (err) {
    console.error("[email] Failed to send order emails:", err);
  }
}
