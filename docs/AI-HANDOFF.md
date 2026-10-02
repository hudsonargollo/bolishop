# ZARIERA — AI Handoff Book

> A complete context handoff for any AI assistant or developer picking up this project.
> Last updated: 2026-10-02 — full audit (§13) **and all findings fixed** (§13.7); session log in §14.
>
> **Rule for every AI session:** record everything you do (audits, fixes, decisions, commands
> run against the DB, open questions) in §14 *Session log* of this file before finishing.

---

## 1. What this is

**ZARIERA** is a premium **stainless-steel / artificial jewelry** e-commerce store (necklaces,
rings, earrings, bracelets/bangles) for a Pakistani client, selling in PKR (Rs). It is **not** real
gold. Storefront + a full admin dashboard.

- **Project root:** `C:\Users\Gigalabs\Downloads\zariera`
- **Owner/developer:** Muhammad Ahmad Waseem (communicates in Roman Urdu)
- **Audience:** Pakistan; COD + online payment (PayFast / Safepay); dropshipping via Leopards / TCS.

---

## 2. Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16.3.5** (App Router, Turbopack, React 19) |
| Language | TypeScript |
| Styling | **Tailwind CSS v4** (CSS tokens in `globals.css`, `@custom-variant dark`) |
| DB / ORM | **PostgreSQL** + **Prisma 6.19.3** |
| Charts | **lightweight-charts 4.2.3** (TradingView) for the zoomable sales graph; custom SVG for rings/donut |
| Email | nodemailer 10 |
| Validation | zod 4 |
| Auth | Custom (HMAC-signed cookie + scrypt password hashing) — no external auth lib |

---

## 3. Run it

```bash
cd C:\Users\Gigalabs\Downloads\zariera
npm install
npm run dev          # http://localhost:3000
```

Other scripts:
- `npm run build` / `npm run start` — production
- `npm run db:migrate` — apply Prisma migrations (dev)
- `npm run db:push` — push schema without migration
- `npm run db:studio` — Prisma Studio (browse DB)
- `npm run db:create-admin` — create/update the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`

### ⚠️ Windows dev-server gotchas (IMPORTANT)
- **Prisma `generate` EPERM:** if `prisma generate`/migrate fails with EPERM, a stray `next` process
  is holding the query engine. Kill it first:
  `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'next dev' } | Stop-Process -Force`
- **Turbopack worker crash after heavy editing:** if pages start returning **500** with
  `Jest worker encountered … exceeding retry limit` or stale `X is not defined` errors in the dev log,
  the HMR/compiler state is corrupted. Fix: kill the `next dev` process, `rm -rf .next`, then
  `npm run dev` again. This is a dev-only artifact, **not** a code bug (verify with `npx tsc --noEmit`).

---

## 4. Environment variables (`.env`)

Copy `.env.example` → `.env`. Currently set: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL`,
`NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_TIKTOK_URL` (socials added 2026-10-02 — **copy these to the production env too**).

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | HMAC secret for admin/customer sessions + reset links. **Required (16+ chars) in production** — app throws without it |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed the admin login (`db:create-admin`) |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL (metadata, payment return URLs) |
| `SMTP_HOST/PORT/USER/PASS/SECURE`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | Order emails (best-effort) |
| `PAYFAST_*`, `SAFEPAY_*` | Online payment gateways (sandbox flags supported). Options are **hidden at checkout until set**; Safepay needs `SAFEPAY_WEBHOOK_SECRET` too |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_PHONE/EMAIL/CITY/HOURS`, `NEXT_PUBLIC_INSTAGRAM_URL/FACEBOOK_URL/TIKTOK_URL` | Store contact + socials (`src/lib/contact.ts`). Blank = hidden (no placeholders) |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD`, `NEXT_PUBLIC_FLAT_SHIPPING` | Shipping policy (defaults 50000 / 500) — `src/lib/shipping.ts` |
| `COURIER_SIMULATION` | `"true"` allows fake courier bookings in production (demo only). Otherwise prod requires real keys |
| `UPLOAD_DIR` | Where admin-uploaded images are stored (default `./uploads`, served at `/uploads/products/…`) |
| `CONFIRM_WIPE` | Must be `yes` for `prisma/import-products.ts` (it deletes ALL orders/products; refuses in production) |
| Courier (in `src/lib/couriers.ts`, add to `.env` to go live): `LEOPARDS_API_KEY`, `LEOPARDS_API_PASSWORD`, `TCS_USERNAME`, `TCS_PASSWORD`, `TCS_CLIENT_ID`, `TCS_COST_CENTER` | Leopards / TCS booking (+ `TCS_CLIENT_SECRET`, `*_ORIGIN_CITY`). Without them: **simulation** (fake tracking) in dev only; refused in production unless `COURIER_SIMULATION=true`. |

Client must provide the real payment + courier credentials before go-live.

---

## 5. Routes map

### Storefront — `src/app/(store)/`
- `/` home (hero slider, categories, featured, **Signature-Edit sliding gallery**, testimonials, newsletter)
- `/shop`, `/shop/[category]`, `/product/[slug]` (Amazon-style detail: 2 buttons, specs, accordions, hover-zoom)
- `/cart`, `/checkout`, `/checkout/success`
- `/login`, `/register`, `/account` (customer accounts; guest checkout supported; `?next=` return-to)
- `/forgot-password`, `/reset-password?token=` — password reset by email (stateless signed 1-hour, single-use link)
- `/account/orders` — guest order tracking (POST server action; email never in URL)
- `/contact` (`?topic=custom` from the Custom page) — real form, saved to DB + emailed to owner
- `/checkout?buy=<slug>&qty=n` — "Buy it now" single-item checkout

### Admin — `src/app/admin/`
- `/admin/login` (outside dashboard layout)
- `/admin/(dashboard)/` layout = **collapsible sidebar** + top bar (via `AdminShell`)

**Sidebar menu (9 items)** — defined in `src/components/admin/admin-nav.tsx` (`ADMIN_LINKS`):
| Menu | Route | Content |
|------|-------|---------|
| Dashboard | `/admin` | KPI cards (8), Recent orders, Quick actions, Low-stock alert |
| **Analytics** | `/admin/analytics` | Zoomable sales graph (`SalesChartPro`) |
| **Insights** | `/admin/insights` | Top products, Sales by category, New customers |
| **Performance** | `/admin/performance` | Store-health rings, Order-pipeline donut |
| Orders | `/admin/orders` + `/[id]` | Orders table (tabs/search), detail: status/payment/shipment |
| Products | `/admin/products` + `/new` + `/[id]` | CRUD, image upload, per-product specs |
| Categories | `/admin/categories` | Add/delete categories |
| Customers | `/admin/customers` | Registered shoppers |
| **Messages** | `/admin/messages` | Contact-form inbox (mark handled) + newsletter / notify-me subscribers |

### API — `src/app/api/`
- `POST /api/orders` — create order (re-prices, validates stock, decrements in a transaction; guest signup on first order; payment redirect for PAYFAST/SAFEPAY)
- `POST /api/admin/upload` — product image upload (admin-guarded, 5 MB, jpg/png/webp/avif)
- `GET /api/admin/orders/stream` — **SSE** real-time new-order notifications (admin-guarded)
- `POST /api/cart/refresh` — current price/stock for cart items (cart self-heals stale snapshots)
- `GET|POST /api/payments/payfast/callback` — PayFast return + IPN, verified by `validation_hash`
- `POST /api/payments/safepay/webhook` — verified by `X-SFPY-SIGNATURE` (HMAC-SHA512)
- `GET /api/payments/cancel?order=` — gateway cancel: releases stock of the unpaid order
- `GET /uploads/products/[file]` — serves admin-uploaded images from `UPLOAD_DIR`

---

## 6. Key components (admin dashboard)

| File | Role |
|------|------|
| `components/admin/admin-shell.tsx` | Full app frame: collapsible sidebar (inline `width` + `100dvh`, independent scroll), header with collapse toggle + notification bell |
| `components/admin/admin-nav.tsx` | `ADMIN_LINKS` + nav (collapsed = icon-only + `title` tooltips, fading labels) |
| `components/admin/sales-chart-pro.tsx` | lightweight-charts area chart: wheel-zoom, drag-pan, crosshair, range presets (1W…All), zoom ±/reset, live insight tiles that recompute for the visible window |
| `components/admin/performance-rings.tsx` | 3 animated radial gauges (fulfilment / payments / stock) |
| `components/admin/order-pipeline-donut.tsx` | Shopify-style donut: colored segments per status, hover → segment pops + others dim + center shows label/count/% + tooltip |
| `components/admin/dashboard-insights.tsx` | `TopProductsPanel`, `CategorySalesPanel`, `RecentCustomersPanel` (server components). *(The unused `OrderPipelinePanel` bar version was removed on 2026-10-02.)* |
| `components/admin/order-notifications.tsx` | Bell + toast + sound + browser notification, driven by the SSE stream |
| `components/admin/status-update-form.tsx` | Client wrapper for order/payment status (toast on save) |
| `components/ui/toast.tsx` | Global toast system (`ToastProvider` + `useToast`), mounted in root layout |
| `components/ui/flash-toast.tsx` | Shows a toast after a server-action redirect via `?flash=<key>` |

Data layer: **`src/lib/admin-data.ts`** — all admin aggregations
(`getAdminStats`, `getSalesDaily`, `getSalesInsights`, `getStorePerformance`,
`getSalesBreakdown`, `getOrderStatusBreakdown`, `getRecentCustomers`, orders/products/customers/categories getters).

---

## 7. Data model (Prisma — `prisma/schema.prisma`)

- **Category** (name, slug, description, products[])
- **Product** (name, slug, price, compareAtPrice, sku, stock, material, **specs**, images[], featured, active, category)
- **Order** (orderNumber, status, paymentMethod, paymentStatus, **paymentRef** (gateway tracker), customer fields, subtotal/shipping/total, **courier/trackingNumber/shippedAt**, items[])
- **OrderItem** (product, name+price snapshots, quantity)
- **Customer** (name, email, passwordHash, phone, orders[]) — storefront accounts
- **User** (email, passwordHash, role) — admin accounts
- **ContactMessage** (name, email, phone, subject, message, topic, handled) — contact form inbox *(new 2026-10-02)*
- **Subscriber** (email unique, source) — newsletter + "notify me" sign-ups *(new 2026-10-02)*
- Status rules live in `src/lib/order-status.ts` (`ORDER_TRANSITIONS`, `PAYMENT_TRANSITIONS`). DELIVERED/CANCELLED are final; cancelling restocks once (`cancelOrderAndRestock` in `lib/orders.ts`).
- Enums: `OrderStatus` (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED), `PaymentMethod` (COD, PAYFAST, SAFEPAY), `PaymentStatus`, `Role`

---

## 8. Notable features already built

- **Order flow fixed** — no fake-success; real errors surfaced; stock decremented atomically.
- **Guest checkout** + optional account creation on first order.
- **Dark / light mode** (token flip, no-flash script) — brand-safe colors.
- **Fully responsive** (mobile + tablet), no horizontal overflow.
- **Toasts everywhere** — add-to-cart, buy-now, quick-add, cart remove, newsletter, checkout,
  login/register/logout, admin product/category/shipment/status actions (see `useToast` + flash-toast).
- **Real-time order notifications** (SSE) with sound + browser notification.
- **Shipping backend** — Leopards / TCS adapter (`src/lib/couriers.ts`), simulation fallback.
- **Admin dashboard** — KPIs, zoomable sales graph, radial gauges, order-pipeline donut,
  top products, category mix, new customers, low-stock alerts.
- **Favicon** = ZARIERA lotus emblem (`src/app/icon.svg`, `favicon.ico`, `apple-icon.png`).

---

## 9. ⚠️ Demo / test data currently in the DB

To make the dashboard charts look populated, **16 demo orders** were seeded with
`orderNumber` starting `QATEST-`, spread across statuses, with line-items. They also inflate the
KPI cards, orders list, and analytics.

**Remove all demo data (orders + items cascade) when done:**
```bash
cd C:\Users\Gigalabs\Downloads\zariera
node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.order.deleteMany({where:{orderNumber:{startsWith:'QATEST-'}}}).then(r=>{console.log('removed',r.count);return p.$disconnect()})"
```
There is also one real earlier test order **`ZR-G2MACF-8SX`** ("hamza") — the client's, leave or remove as they wish.

> Note: temporary QA admin accounts (`qa-toast-admin@zariera.com`) were used during testing and
> deleted. Only the real admin (`ADMIN_EMAIL`) should exist.

---

## 10. Testing status (last full pass)

- `npx tsc --noEmit` → **clean (EXIT 0)** (re-verified 2026-10-02)
- ~~`npx eslint src` → 12 errors, 3 warnings~~ → **0 problems** after fixes (2026-10-02)
- `npx next build` → **success, no warnings** (2026-10-02)
- **End-to-end run against the production build (2026-10-02): 45/45 + 9/9 admin checks passed** — pages,
  canonical/robots/sitemap, forged-cookie rejection, payment-callback forgery rejection, upload hardening,
  server re-pricing, atomic stock (2 concurrent orders for the last unit → exactly 1 succeeds), success page
  from DB, contact form saved to DB. All QA test data was deleted and stock restored afterwards.
- All 8 admin menu items navigate to the correct page; content renders.
- Store: home / shop / product = 200; add-to-cart toast works.
- Sidebar collapse (76px), independent scroll, mobile nav all verified.
- Sales graph zoom/pan/presets, donut hover-targeting, rings animation verified.

---

## 11. Suggested next steps / TODO

- Get **real payment + courier credentials** from the client; test live checkout + booking.
- Remove demo data before go-live (section 9).
- Optional dashboard extras: today's snapshot, payment-method split (COD vs online),
  repeat-vs-new customers, low-stock auto-reorder hints.
- Consider real analytics (traffic/sessions/device) — currently sales-only (no visitor tracking yet).
- Deployment: needs a **long-running Node host / VPS** (SSE notifications + in-memory event bus are
  process-local; serverless/Vercel would need Redis pub-sub for cross-instance delivery).
- Add product photography from the client (placeholders/stock used for lifestyle imagery).

---

## 12. House rules observed with this client

- Speaks Roman Urdu; wants **premium / international** look and **smooth** interactions.
- Do the work in one pass; verify (screenshots / real tests) before saying "done".
- Never fabricate authentic product photos; never log into the client's personal accounts.
- Keep colors on-brand (maroon `#5b1a2b`, gold `#c39a4e`, cream `#f4e8d5`); dark mode must not clash.
- **Every action an AI takes on this project must be logged in §14 (Session log) of this file** (user request, 2026-10-02).

---

## 13. Full audit — 2026-10-02

Complete read-through of every source file (`src/**`, `prisma/**`, config, docs) and the three PDFs
(`ZARIERA-Proposal.pdf`, `ZARIERA-Requirements.pdf`, `ZARIERA-Project-Handbook.pdf`).
**No code was changed during the audit.** Items marked ✅ *verified* were confirmed by reading the code
directly; the rest come from static review and have not been reproduced in a running app.

### 13.1 Repo state at audit time
- Only 2 commits (`6186fb7` initial, `77a13ec` "full build + QA polish").
- **87 uncommitted changes**, incl. whole untracked features: admin analytics / insights / performance /
  categories / customers pages, `api/admin/*` (upload + SSE), `lib/couriers.ts`, `lib/order-events.ts`,
  `components/ui/*` (toasts), promo slider, support chat, theme toggle, 2 migrations
  (`shipping_fields`, `product_specs`), the PDFs and `docs/`. → **Commit soon** to avoid losing work.
- `.env` has DATABASE_URL, NEXT_PUBLIC_SITE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD only.

### 13.2 PDFs summary
- **Proposal (5 pp):** dev Rs 15,000 one-time; hosting/yr — Starter Rs 40k (1 vCPU/2 GB, monthly backup),
  **Standard Rs 55k (recommended)** (2 vCPU/4 GB, weekly backup, WhatsApp support, basic SEO),
  Premium Rs 90k (4 vCPU/8 GB, daily backup, uptime monitor, online payment setup, CDN).
  Gateways ~2%/order; changes Rs 1,000–5,000 each.
- **Requirements (3 pp):** what the client must supply — products (PKR prices, 2–3 photos each,
  Necklaces & Earrings items), business info (WhatsApp, email, address, socials, logo), courier
  (Leopards/TCS creds, origin city, shipping policy), payments (PayFast/Safepay keys, optional bank
  transfer), domain + hosting plan, SMTP, admin login, policies (returns/privacy/terms).
  Store can launch on COD with essentials only.
- **Handbook (7 pp, v1.0, 29 Sep 2026):** technical handoff for client "Saad"; mirrors this file.
  Minor: its TOC lists 15 sections but body has 16.

### 13.3 🔴 Critical security issues (fix before go-live)
1. ✅ *verified* **Customer cookie works as admin cookie (privilege escalation).**
   `lib/auth.ts` and `lib/customer-auth.ts` sign with the same `AUTH_SECRET` and the same
   `payload.sig` format; `readToken` (`auth.ts:29`) only checks signature + `exp`, and
   `requireAdmin` (`lib/admin.ts:27`) never checks `role`. Copying a `zariera_customer` value into
   `zariera_admin` grants `/admin`. Fix: domain-separate the HMAC (e.g. sign `"admin:"+payload`),
   require `role` in the admin payload, and/or re-check the `User` row.
2. ✅ *verified* **Hardcoded fallback secret** `"dev-secret-change-me"` (`auth.ts:13`, `customer-auth.ts:12`)
   when `AUTH_SECRET` is unset → forgeable sessions. Fix: throw in production if unset.
3. ✅ *verified* **Payment callbacks unauthenticated.** `api/payments/payfast/callback/route.ts` trusts
   `basket_id` + `err_code=000`; Safepay webhook likewise (treats `payment:created` as paid). No
   signature/amount check. Order numbers (`lib/orders.ts:39-43`) use `Math.random()` with 3 chars → guessable.
4. ✅ *verified* **Upload trusts client MIME and keeps client extension** (`api/admin/upload/route.ts:29,43`)
   → `x.html` sent as `image/png` is saved as `.html` in `public/` (stored XSS). Fix: derive extension from
   an allow-listed type and check magic bytes. Also: runtime writes to `public/` aren't served by
   `next start` / standalone — use object storage or a served uploads dir.
5. **Guest orders exposed by email.** `/account` (`(store)/account/page.tsx:30`) lists guest orders matching
   the account email; registration doesn't verify email → register a victim's email to see their orders.

### 13.4 🟠 Functional / logic bugs
- **Overselling race:** stock checked outside the transaction (`lib/orders.ts:71`) and decremented without a
  `stock >= qty` guard (`:113-118`). No stock restore on cancel / failed payment.
- **`markOrderPayment` has no state guard** (`lib/order-payment.ts:10`): can flip CANCELLED/DELIVERED back to
  CONFIRMED, or PAID → FAILED; not idempotent. Admin status changes are free-form (any → any), no audit log
  (`admin/(dashboard)/orders/actions.ts:85,103`).
- **Gateways not wired correctly:** PayFast `SIGNATURE` = order number (`lib/payments.ts:80`); success URL
  bypasses the callback route; Safepay init doesn't send order reference / webhook URL (`:116-124`), so the
  webhook lookup likely never matches.
- **Checkout UX for online payments:** gateway unconfigured → silently COD-style success
  (`api/orders/route.ts:85-87`); `/checkout/success` clears the cart regardless of payment result, shows
  `?total=` from the URL, and shows COD wording for card orders; cancelled payment + retry = duplicate order.
- `returnUrl` built from `request.url` (Host header controls gateway redirect, `api/orders/route.ts:65`).
- **Email case mismatch:** stored as typed (`lib/orders.ts:99`), looked up lowercased (`lib/order-lookup.ts:31`).
- **Courier double-booking race** (`orders/actions.ts:35-64`); missing creds silently simulate and mark SHIPPED.
- **Canonical URL bug:** root `alternates.canonical: "/"` (`app/layout.tsx:44`) is inherited by every page.
- Literal `&amp;` rendered on `/shop` (`(store)/shop/page.tsx:23`).
- Product thumbnails don't switch the main image (`product/[slug]/page.tsx:144-151`).
- Price filter inputs uncontrolled — don't clear; min>max not validated (`shop/shop-filters.tsx:107,116`).
- Cart clamp `Math.max(1, stock)` allows qty 1 of sold-out items; stock snapshot never refreshed
  (`cart/cart-provider.tsx:64`).
- "Buy it now" checks out the whole cart, not just the item (`cart/add-to-cart.tsx:23-27`).
- Toasts and chat launcher both fixed bottom-right → overlap.
- No rate limiting on admin/customer login; 6-char min password; register reveals existing emails;
  no password reset; login has no return-to URL; `/account/orders` puts email in the query string.
- Deletes swallow FK errors silently (`products/actions.ts:106`, `categories/actions.ts:57`).
- ⚠️ `prisma/import-products.ts` runs `deleteMany()` on **all orders**, items and products — never run on prod.
- SSE notifications are process-local (`lib/order-events.ts`) — single-instance host only.

### 13.5 🟡 Placeholders / content issues
- Contact form and newsletter send nothing (`(store)/contact/page.tsx:29-33`, `components/newsletter.tsx:58-69`);
  "Start Your Design" and "Notify me" both route to that dead form.
- Placeholder phone `+92 300 0000000`, WhatsApp fallback `923000000000`, generic instagram.com / facebook.com
  links (`site-footer.tsx`, `support-chat.tsx`, `(store)/page.tsx:300`). Set `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- Fabricated social proof: "Verified buyer" reviews, "4.9/5 from 500+" (`testimonials.tsx:64,109`), 5 stars on every
  product (`product/[slug]/page.tsx:169-176`), chat "replies in minutes". Legal/trust risk — replace with real reviews.
- "Best sellers" is actually newest; "Bestseller" badge = `featured` flag.
- Delivery time inconsistent: 2–4 days (product page, chat) vs 3–5 (FAQ, shipping page).
- Free-shipping "Rs 50,000" hardcoded in `marquee.tsx:4`, `(store)/page.tsx:42` instead of
  `FREE_SHIPPING_THRESHOLD`; value looks implausibly high (maybe meant 5,000) — confirm with client.
- Every product claims "gold-plated over surgical-grade steel" / nickel-free, incl. silver pieces.
- Chat "Track my order" sends to WhatsApp instead of `/account/orders`.
- `robots.ts` doesn't disallow `/account`, `/login`, `/register`; sitemap uses `new Date()` for all entries.
- Storefront imports `components/admin/status-badge`; "jewellery" vs "jewelry" spelling mix.
- Unused `OrderPipelinePanel` in `dashboard-insights.tsx` (noted in §6).

### 13.6 Recommended fix order
1. Admin/customer token separation + role check (§13.3 #1) and fail-closed `AUTH_SECRET` (#2).
2. Upload hardening (#4).
3. Payment callback verification + `markOrderPayment` state guard — before enabling any gateway.
4. Atomic stock decrement (`updateMany where stock >= qty`) + restore on cancel.
5. Email lowercase normalisation; guest-order exposure (verify email, or match by `customerId` only).
6. Canonical URL, `&amp;`, thumbnails, filters, lint errors.
7. Content: real contact details, remove fake reviews, fix delivery-time / material copy.

### 13.7 ✅ Fix status (2026-10-02) — everything in §13.3–13.5 addressed

| # | Finding | Fix | Where |
|---|---------|-----|-------|
| C1 | Customer cookie = admin cookie | Per-kind derived HMAC keys + `kind` in payload; admin role checked; **every admin request re-checks the `User` row** (`getVerifiedAdmin`) | `lib/session-token.ts`, `lib/auth.ts`, `lib/customer-auth.ts`, `lib/admin.ts` |
| C2 | Default secret | Throws in production if `AUTH_SECRET` missing/short | `lib/session-token.ts` |
| C3 | Unverified payment callbacks | PayFast `validation_hash` + amount check; Safepay HMAC-SHA512 signature + tracker match (`Order.paymentRef`); idempotent, state-guarded `markOrderPayment`; crypto-random order numbers (8 chars) | `lib/payments.ts`, `lib/order-payment.ts`, `api/payments/*`, `lib/orders.ts` |
| C4 | Upload XSS | Magic-byte sniffing, extension derived from content; stored in `UPLOAD_DIR` (not `public/`) and served with `nosniff` | `lib/uploads.ts`, `api/admin/upload`, `app/uploads/products/[file]` |
| C5 | Guest orders exposed by email | `/account` lists only `customerId`-linked orders; guests use `/account/orders` (POST) | `(store)/account/page.tsx`, `account/orders/*` |
| — | Overselling race | Conditional `updateMany(stock >= qty)` inside interactive transaction; duplicate cart lines merged | `lib/orders.ts` |
| — | No restock / free-form status | Transition tables; cancel restocks exactly once; conditional updates (no lost updates); status dropdown shows only allowed moves | `lib/order-status.ts`, `admin/(dashboard)/orders/*`, `status-update-form.tsx` |
| — | Gateway wiring | Callback URLs from `NEXT_PUBLIC_SITE_URL` (not Host header); PayFast `CHECKOUT_URL` = IPN; random `SIGNATURE`; cancel route releases stock; gateway init failure cancels + restocks | `api/orders/route.ts`, `api/payments/cancel` |
| — | Unconfigured gateway → fake success | Online options hidden + API rejects them | `checkout/page.tsx`, `checkout-form.tsx`, `api/orders/route.ts` |
| — | Success page trusted URL / cleared cart | Reads order from DB; failed payment → back to checkout; removes only ordered items from cart; online wording | `checkout/success/page.tsx`, `cart/clear-cart.tsx` |
| — | Email case mismatch | Lowercased on save; case-insensitive lookup for old rows | `lib/orders.ts`, `lib/order-lookup.ts` |
| — | Courier double-booking / fake SHIPPED | Atomic claim before booking (released on failure); no simulation in prod unless `COURIER_SIMULATION=true`; won't ship cancelled/unpaid-online orders | `orders/actions.ts`, `lib/couriers.ts` |
| — | No rate limits / weak passwords / no reset / no return-to | In-memory limiter on admin+customer login, register, reset, orders, tracking, contact, newsletter; min password 8; forgot/reset flow; `?next=` with open-redirect guard; signed-in users skip login/register | `lib/rate-limit.ts`, `(store)/auth-actions.ts`, login/register/forgot/reset pages |
| — | Canonical / robots / sitemap | Root canonical removed; per-page canonicals; robots disallow account/auth/search; sitemap without `/search` and fake `lastModified`; `/search` noindex | `app/layout.tsx`, pages, `robots.ts`, `sitemap.ts`, `lib/site.ts` |
| — | `&amp;` on /shop, thumbnails, filters, cart clamp, Buy now, toast overlap, cart flash | Fixed; `ProductGallery` with clickable thumbs; filter form re-mounts + min/max swap; sold-out clamps to 0; cart synced across tabs + refreshed from server; single-item Buy now; toasts above chat; loading skeletons | various components |
| — | Inactive products reachable by URL | `getProductBySlug` filters `active: true` *(found while fixing)* | `lib/catalog.ts` |
| — | `.env.example` git-ignored | `!.env.example` added to `.gitignore` *(found while fixing)* | `.gitignore` |
| — | Silent delete failures | Flash toasts: deleted / in use / failed | products & categories `actions.ts`, `flash-toast.tsx` |
| — | `import-products.ts` wipes orders | Refuses unless `CONFIRM_WIPE=yes`, never in production | `prisma/import-products.ts` |
| — | Dead contact form / newsletter / notify-me | Real server actions → `ContactMessage` / `Subscriber` tables (honeypot + rate limit) + owner email; admin **Messages** page | `(store)/inbound-actions.ts`, `contact-form.tsx`, `newsletter.tsx`, `notify-form.tsx`, `admin/(dashboard)/messages` |
| — | Placeholder phone/WhatsApp/socials | Env-driven `CONTACT`; blank values hidden; chat falls back to contact page | `lib/contact.ts`, footer, contact page, support chat, home |
| — | Fake reviews / 5 stars / "500+" / "replies in minutes" | Testimonials hidden until real reviews are added (avg computed from real list; "Verified" only if flagged); product-page stars removed; chat status honest | `testimonials.tsx`, product page, support chat |
| — | Misleading copy | "Best sellers" → "New arrivals"; "Bestseller" badge → "Featured"; delivery time unified (`DELIVERY_TIME` = 3–5 working days); material claims depend on product material (no "18K", no blanket gold-plated/nickel-free); chat "Track order" → Order Status page | home, product, FAQ, shipping, about, chat, `lib/shipping.ts` |
| — | Lint errors (12) | `useSyncExternalStore` / `useMounted` instead of setState-in-effect; prefix sums in donut; tooltip width measured at event time | cart provider, theme toggle, toast, admin shell, mobile menu, donut, sales chart |
| — | Misc | Unused `OrderPipelinePanel` removed; `StatusBadge` moved to `components/status-badge.tsx`; email escape covers quotes; "jewelry" spelling unified; uploads tracing warning silenced | — |

**Still open (need the client / a decision — not code bugs):**
- Real PayFast/Safepay keys → **sandbox-test both callbacks**; confirm the signature formulas in §13.7 C3 against the merchant docs (they follow public docs, unverified against a live account).
- Courier API keys; SMTP (reset emails + order emails + contact alerts are skipped without it — contact messages are still saved in Admin → Messages).
- Confirm free-shipping threshold (Rs 50,000 looks high — maybe 5,000) → set `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD`.
- Fill remaining contact env vars: `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_CONTACT_PHONE` (socials + email are done).
- **⚠️ GO-LIVE: replace the sample testimonials** in `src/components/testimonials.tsx` (restored on request for pre-launch; names, "Verified buyer" and "4.9/5 from 500+" are placeholders).
- Delete `QATEST-` demo orders before go-live (§9) — **not deleted** (client decision).
- Register still says "email already exists" (normal UX; rate-limited). True fix = email verification (not built).
- Rate limiter trusts `X-Forwarded-For` — deploy behind a proxy that sets it (nginx/Caddy), single instance.
- Customer emails for online orders are sent at order creation (before payment confirmation).

---

## 14. Session log

Append one entry per AI/dev session: date, what was done, files changed, DB commands, open questions.

### 2026-10-02 — Full audit (Claude)
- Read every file in the project (excluding `node_modules`, `.next`) + all 3 PDFs.
- Ran `npx tsc --noEmit` (pass) and `npx eslint src` (12 errors / 3 warnings).
- Verified the critical auth / payment / upload issues by reading the code directly.
- Wrote §13 (audit findings) and this §14 log; updated the header, §10 testing status and §12 house rules.
- **Files changed:** `docs/AI-HANDOFF.md` only. **No code changes, no DB changes.**
- **Open question to user:** fix the critical items now, or log them as Jira tickets in project KAN?
  → User answered: **"fix everything you find"** (see next entry).

### 2026-10-02 — Fixed every audit finding (Claude)
- **Backup before changes:** copy of `src/`, `prisma/`, `docs/` taken in the session scratchpad (temporary).
- **What changed:** see §13.7 table (security, payments, stock, checkout, auth, admin, SEO, UI, content, lint).
- **New files:** `src/lib/{session-token,site,rate-limit,contact,uploads,use-mounted}.ts`,
  `src/app/api/{cart/refresh,payments/cancel}/route.ts`, `src/app/uploads/products/[file]/route.ts`,
  `src/app/(store)/{forgot-password,reset-password}/page.tsx`, `src/app/(store)/inbound-actions.ts`,
  `src/app/(store)/account/orders/actions.ts`, `src/app/admin/(dashboard)/messages/{page,actions}.ts(x)`,
  `src/components/{product-gallery,order-lookup,contact-form,notify-form,status-badge}.tsx`,
  `src/components/auth/{login-form,register-form,password-reset-forms}.tsx`.
- **Moved:** `components/admin/status-badge.tsx` → `components/status-badge.tsx` (imports updated);
  login/register page bodies → `components/auth/*-form.tsx` (pages are now server components).
- **Removed:** fabricated testimonials list, product-page 5-star line, `OrderPipelinePanel`.
- **DB (local dev `localhost:5432/zariera`) — migrations applied with `prisma migrate deploy`:**
  - `20261002120000_payment_ref` → `Order.paymentRef` + index
  - `20261002130000_contact_newsletter` → `ContactMessage`, `Subscriber` tables
  - Verified: `prisma migrate diff` DB ↔ schema = *No difference*.
  - QA rows created during testing (3 orders, 1 contact message, product stock change) were **deleted / restored**.
- **⚠️ Restart the dev server** (`next dev`, it was running as PID 13292 during this session): `prisma generate`
  hit the known Windows EPERM because the dev server locks the query engine. Types/client were regenerated,
  but the running process still has the old client in memory — Contact/Messages need a restart. If generate
  fails again: stop `next dev`, run `npx prisma generate`, start again.
- **All existing sessions were invalidated** (new token format) — admin and customers simply sign in again.
- **Verification:** `tsc` 0 errors · `eslint` 0 problems · `next build` OK (no warnings) · e2e 45/45 + admin 9/9 (see §10).
- **Not committed to git** (user didn't ask). 142 changed/untracked paths — commit soon.
- **Docs updated:** this file (§4, §5, §7, §10, §13.7, §14), `README.md` (auth, payments, Docker volume, checklist),
  `.env.example` (all new vars), `Dockerfile` (`/app/uploads` volume), `.gitignore`, `.dockerignore`.

### 2026-10-02 — Mobile slider controls placement (Claude)
- **Issue (client screenshot, mobile):** "Signature Edit" promo slider arrows sat on top of the photo in the
  bottom-right corner, overlapping the image and the gold frame line; the chat button covered heading text.
- **Fix — `src/components/promo-slider.tsx`:** arrows removed from the image. New single control row under
  "Shop the Collection": `‹  01 / 16 + gold progress bar  ›` on mobile/tablet (16 dots don't fit), and
  `‹  dots  ›` on desktop (`lg+`). Added touch **swipe** left/right on the photo. `ArrowButton` helper added.
- **Fix — `src/components/support-chat.tsx`:** launcher is smaller on phones (48px, `sm:` 56px), sits
  `right-4` and respects the iOS safe-area; chat panel offset adjusted to match.
- **Verified** in the browser at 375×812 (mobile), 768×1024 (tablet) and 1366×800 (desktop): photo clean,
  controls centred inside the gold frame, nothing overlapping. `tsc` 0 errors, `eslint` 0 problems.
- Note: the black round **"N"** button bottom-left is the Next.js **dev-only** indicator — it does not
  appear on the live site.

### 2026-10-02 — Testimonials restored (Claude)
- **Request:** user asked to bring back the original reviews section exactly as before ("a to z"), since the
  store isn't live yet and real customer reviews will be added at launch.
- **Done:** `src/components/testimonials.tsx` restored byte-for-byte from the pre-fix backup (6 reviews, two
  sliding rows, "4.9/5 from 500+ happy clients", "Verified buyer"). Only a top-of-file reminder comment was
  added (no UI change). Shows on the home page again — verified in the browser, no console errors.
- **Go-live TODO (added to §13.7 "Still open"):** replace these sample reviews with real ones before launch —
  invented names/ratings/"Verified buyer" on a live store mislead shoppers.

### 2026-10-02 — Social links + email wired (Claude)
- **Client-provided links** added to `.env` (all icons read them via `src/lib/contact.ts`):
  - Email: `zariera.jewelry@gmail.com`
  - Instagram: `https://www.instagram.com/zariera_realm`
  - Facebook: `https://www.facebook.com/share/1BNJEB67dh/` (redirects to the "Zariera Jewellery" page)
  - TikTok: `https://www.tiktok.com/@zariera_realm`
  - Tracking params (`utm_*`, `share_id`, `user_id`, `sec_uid`…) were stripped from the shared TikTok /
    Instagram URLs — same profile, clean link, no personal share identifiers.
- **Where they appear:** footer social icons (Instagram, Facebook, TikTok, Email) + "Get in touch" email,
  home "Follow us on Instagram" button, contact page sidebar.
- **Fix:** footer `Social` links only use `target="_blank"` for web URLs — `mailto:` now opens the mail app
  without an empty extra tab (`src/components/site-footer.tsx`).
- **Tested:** each URL resolves HTTP 200 to the right profile; rendered hrefs checked on `/` and `/contact`;
  icons visible in the footer; clicking the Instagram icon triggers the new-tab open. `tsc`/`eslint` clean.
- **Not yet set:** WhatsApp number and phone (WhatsApp icon + chat WhatsApp button stay hidden until set).
- **Deploy note:** `NEXT_PUBLIC_*` values are baked in at build time — add them to the production env
  before `npm run build`.

### 2026-10-02 — Email icon "does nothing" fix (Claude)
- **Report:** clicking the footer Email icon did nothing. Cause: `mailto:` needs a default mail app; the user's
  Windows (like many shoppers on web Gmail) has none, so the browser silently ignores it. Not a code bug.
- **Fix:** new client component `src/components/email-link.tsx` — on click it copies the address to the
  clipboard and shows a toast ("Email copied" / fallback "Our email" if the clipboard is blocked), then still
  follows `mailto:` so a mail app opens when one is installed.
- **Used in:** footer Email icon, footer "Get in touch" email, contact page sidebar email.
- **Tested** in the browser: click → toast with the address appears; `tsc`/`eslint` clean.
  (In the automated test pane the clipboard is blocked, so the fallback toast showed; real user clicks copy.)
- Option if the client prefers: open Gmail web compose instead
  (`https://mail.google.com/mail/?view=cm&to=zariera.jewelry@gmail.com`) — not done, awaiting preference.

### 2026-10-03 — Dev crash fix, image optimisation, full QA pass, Netlify-ready (Claude)
**1. "Jest worker encountered 2 child process exceptions" (dev only)**
- Known Turbopack dev-cache corruption (see §3). Fixed by stopping all `next` processes (incl. a
  leftover `next start -p 3100` test server from the previous session), deleting `.next` (883 MB) and
  re-running `prisma generate` (finally succeeded — no process holding the engine). Not a code bug.
- If it ever returns: stop `next dev`, `rm -rf .next`, `npx next typegen`, `npm run dev`.

**2. Speed**
- Images re-encoded (originals backed up in the session scratchpad): **10.8 MB → 4.9 MB**, max 1600 px
  wide, mozjpeg q80, same filenames. Two product PNGs (~1 MB each, opaque) → JPG (~30 KB):
  `astra-pave-bangle.jpg`, `papillon-butterfly-bangle.jpg` — DB rows + `prisma/import-products.ts` updated.
- Hero + promo sliders now only download the visible slide and its neighbours (were all 5 / all 16 at once).
- Measured: DB queries 2–13 ms; dev mode ~1 s/page (on-demand compile), **production build 50–250 ms/page**.
  User decided further speed work waits for the paid server.

**3. Full QA pass (production build on :3100)**
- Crawl: 43/43 routes OK (every product + category, filters, search, 404, robots, sitemap).
- Suite: 44/45 — the one "fail" is the restored sample reviews (expected, by request).
- Browser flows ✅: add to cart, quick add, cart, checkout COD (Rs 6,300 + 500 shipping = 6,800), success
  page, order tracking (case-insensitive), register (8-char min enforced), sign out, guarded /account →
  login?next, wrong password, sign in; admin login, dashboard, order status change, courier booking
  (correctly refused without keys in prod), cancel → **stock restored**, product create / edit (price
  shows on storefront) / delete, delete of product with orders blocked with message, category add/delete,
  all 10 admin pages 200.
- **Bugs found & fixed in this pass:**
  - Forms wiped all fields after an error (React 19 form-action reset) → actions echo `values`, inputs use
    them as `defaultValue` (login, register, forgot password, admin login, contact, order tracking).
  - Home page didn't show admin product/category changes for up to 5 min → `revalidatePath("/", "layout")`.
  - Category Delete had no confirmation (one click deleted Necklaces/Earrings) → `DeleteButton` confirm.
  - Cart page + all admin pages had the generic site title → `cart/layout.tsx` metadata; admin titles
    "<Page> · ZARIERA Admin" + admin `noindex`.
  - Checkout labels not linked to inputs (screen readers) → `id`/`htmlFor` pairs.
- QA data cleaned up afterwards (see below).

**4. Netlify deploy readiness** — guide: **`docs/DEPLOY-NETLIFY.md`**
- `next.config.ts`: `output: "standalone"` only when NOT on Netlify (`NETLIFY=true` at build);
  `outputFileTracingIncludes` ships the Prisma engine.
- `prisma/schema.prisma`: `binaryTargets = ["native", "rhel-openssl-3.0.x"]` (Netlify/AWS Lambda) and
  `directUrl = env("DIRECT_URL")` (Neon pooled URL for the app, direct URL for migrations).
  **`DIRECT_URL` added to local `.env`** (= DATABASE_URL) and `.env.example`.
- `netlify.toml`: build = `npx prisma migrate deploy && npm run build`, Node 22.
- `netlify.env.example`: every env var to import into Netlify (socials pre-filled, `COURIER_SIMULATION=true`
  for the demo).
- Uploads: `src/lib/uploads.ts` `saveUpload/readUpload` → disk on VPS, **Netlify Blobs** on Netlify
  (store `product-uploads`, new dep `@netlify/blobs` 10.7). Upload + `/uploads/products/[file]` routes use it.
- Live order bell works on serverless: SSE route now also polls the DB every 5 s from a `since` cursor;
  client reconnects with the last seen `createdAt`, de-duplicates by id.
- New `npm run db:copy` (`prisma/copy-data.ts`): copies all data local → cloud DB, idempotent
  (tested into a temp DB `zariera_copytest`: 4 categories, 15 products, 1 admin, 4 customers, 18 orders,
  37 items; re-run skipped all; temp DB dropped).
- `NETLIFY=true next build` → success, no standalone folder (correct).
- ⚠️ Local admin password is weak (`.env`) — the guide sets a strong one on the cloud DB via
  `db:create-admin` before the demo URL is shared.
- **Netlify build verified locally** with `netlify-cli build --offline`: "Netlify Build Complete";
  server function `___netlify-server-handler` contains `libquery_engine-rhel-openssl-3.0.x.so.node`.
  `/.netlify/` added to `.gitignore`.
- **Final regression on the latest build:** e2e 44/45 (only the expected sample-reviews check), admin
  titles ("Orders · ZARIERA Admin"), cart title ("Shopping Bag · ZARIERA"), upload + serve OK, and live
  order alert **delivered via DB polling** (order inserted straight into the DB → `event: order` on the
  admin stream within 5 s — this is the Netlify path). Stream poll errors are now logged.
  (A first "fail" here was a bug in the test script's stream reader, not the app.)
- `README.md` → Netlify section + `DIRECT_URL` note.
- All local test servers stopped; QA data removed (DB back to 17 orders / 15 products / 3 customers /
  4 categories). **Dev server is NOT running** — start it with `npm run dev`.
- **Not committed/pushed yet** (~86 changed paths). Next step for the user: `git add -A && git commit && git push`,
  then follow `docs/DEPLOY-NETLIFY.md`.

### 2026-10-03 — Commit + push attempt, dev server restarted (Claude)
- Committed everything locally on `main`: **`8e35c02`** "Netlify-ready demo: QA fixes, socials, optimized
  images, deploy setup" (86 files). Secrets scan before commit: `.env`, uploads, `.netlify/` not included.
- **Push FAILED:** `Permission to mian76951-ui/zariera_project.git denied to nabeel-warraich` — the SSH key
  on this PC belongs to GitHub user `nabeel-warraich`, who has no write access to the repo.
  Fix (user): add `nabeel-warraich` as a collaborator on the repo (GitHub → repo → Settings →
  Collaborators → Add people → accept the invite), **or** push from the `mian76951-ui` account
  (e.g. GitHub Desktop signed in as that account, or HTTPS remote + that account's token). Then `git push origin main`.
- Dev server restarted in the background (hidden window, no terminal tab — user preference):
  `npm run dev` → http://localhost:3000, log in the session scratchpad. Stop it with:
  `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'next dev' } | Stop-Process -Force`

### 2026-10-03 — Dark band above footer fixed (Claude)
- **Report (screenshot, dark mode):** a dark empty band between the last section and the footer on every page.
- **Cause:** `SiteFooter` had `mt-24` (96 px margin) since the original commit. The margin shows the body
  background; in light mode it matches the cream page (invisible), in dark mode it's a visibly darker strip.
  Missed in earlier QA because the visual checks were done in light mode.
- **Fix:** removed `mt-24` from `src/components/site-footer.tsx`; pages keep their own bottom padding
  (measured content→footer: shop 56, care/faq/shipping/contact/orders/search 64, cart 116, checkout 167 px;
  home/about/custom end in a full-width coloured section that now meets the footer directly). Product page
  bottom padding raised 40 → 80 px (`pb-20`).
- **Verified** in dark + light, desktop + mobile (main→footer gap 0 px). `tsc`/`eslint` clean.
- Deploy target confirmed by user: **Netlify** (not Vercel) — config already in place (netlify.toml etc.).
