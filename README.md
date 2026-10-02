# ZARIERA — E-Commerce Store

Luxury jewelry storefront for **ZARIERA** — _"Every Jewel Tells a Story."_
Built to the approved **Standard package** scope.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** ORM + **PostgreSQL**
- **Zod** for validation
- Fonts: Cormorant Garamond (serif) + Jost (sans)
- Payments (Phase 4): PayFast / Safepay + Cash on Delivery

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure the database**
   Copy `.env.example` to `.env` and set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/zariera?schema=public"
   ```
   > Free hosted Postgres: [Neon](https://neon.tech) or [Supabase](https://supabase.com).

3. **Create the schema & seed sample data**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Useful scripts

| Command            | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start the dev server                  |
| `npm run build`    | Production build                      |
| `npm run db:migrate` | Run Prisma migrations               |
| `npm run db:push`  | Push schema without a migration       |
| `npm run db:seed`  | Seed categories + sample products     |
| `npm run db:studio`| Open Prisma Studio (DB GUI)           |

## Data model (Prisma)

`Category · Product · Order · OrderItem · User (admin)` — see `prisma/schema.prisma`.
Money is stored as `Decimal` (PKR). Order items snapshot name/price so historical
orders stay accurate.

## Roadmap

- [x] **Phase 1 — Foundation:** project setup, brand theme, layout, DB schema, seed
- [x] **Phase 2 — Storefront:** shop + category pages, product detail, search, filters (material/price/sort), cart (localStorage), checkout (COD), order confirmation
- [x] **Phase 3 — Admin:** login (cookie session), dashboard stats, product CRUD, order management + status updates
- [x] **Phase 4 — Payments, SEO, deploy:** PayFast/Safepay integration + COD, SEO (sitemap/robots/JSON-LD/OG), Docker deploy config

### Admin (Phase 3)

| Route | Page |
| ----- | ---- |
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard — revenue, orders, products stats |
| `/admin/products` | Product list (edit / delete) |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/orders` | Order list |
| `/admin/orders/[id]` | Order detail + update status / payment status |

> **Login:** admins are `User` records in the database — create/update one with
> `npm run db:create-admin` (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`).
> Sessions are HMAC-signed httpOnly cookies (`AUTH_SECRET`, **required in
> production**); admin and customer tokens use separate signing keys, and every
> admin request re-checks the account in the DB. Logins are rate-limited.

### Theme

Warm cream + deep wine + antique gold, per the client's approved mockup — cream
hero inside an ornamental double-line frame, gold lotus emblem, maroon footer.
Tokens live in `src/app/globals.css`.

### Storefront routes (Phase 2)

| Route | Page |
| ----- | ---- |
| `/` | Home — hero, categories, featured products |
| `/shop` | All products + filters (material, price, sort) |
| `/shop/[category]` | Category listing |
| `/product/[slug]` | Product detail + add to cart + related |
| `/search?q=` | Search results |
| `/cart` | Shopping bag |
| `/checkout` | Contact/delivery form + payment method |
| `/checkout/success` | Order confirmation |
| `POST /api/orders` | Create order (re-prices & validates stock against DB) |

> **Preview mode:** until `DATABASE_URL` points at a live, seeded database, the
> storefront serves bundled sample data and checkout simulates a successful order.
> Connect the DB + run migrate/seed and everything becomes live with no code changes.

### Payments (Phase 4)

- **Cash on Delivery** — works out of the box.
- **PayFast** and **Safepay** — online card/wallet payments. Integration lives in
  `src/lib/payments.ts`. Add the client's merchant credentials to `.env`
  (`PAYFAST_MERCHANT_ID`, `PAYFAST_SECURED_KEY`, `SAFEPAY_API_KEY`,
  `SAFEPAY_WEBHOOK_SECRET`) to activate. Until then the online options are
  **hidden** at checkout (and rejected by the API).
- Gateway callbacks: `/api/payments/payfast/callback` (GET redirect + POST IPN,
  verified with PayFast's `validation_hash`) and `POST /api/payments/safepay/webhook`
  (verified with `X-SFPY-SIGNATURE`). Unverified callbacks are ignored; payment
  state changes are idempotent; failed/cancelled payments release stock.
  **Test both in sandbox with the client's keys before going live** — confirm the
  signature formulas against their merchant docs.

### SEO (Phase 4)

- `sitemap.xml` (`src/app/sitemap.ts`) and `robots.txt` (`src/app/robots.ts`)
- Per-page metadata + canonical URLs + Open Graph / Twitter cards
- JSON-LD structured data: Organization + WebSite (home), Product + Offer (product pages)
- Set `NEXT_PUBLIC_SITE_URL` to the production domain so these emit absolute URLs.

## Deployment

**Vercel (simplest):** import the repo, set the env vars from `.env.example`,
deploy. Run `npx prisma migrate deploy` against the production database.

**Docker / VPS:** the app builds to a standalone server (`output: "standalone"`).
Use a **single long-running instance** (live order alerts + rate limits are in-memory).

```bash
docker build -t zariera .
docker run -p 3000:3000 --env-file .env -v zariera-uploads:/app/uploads zariera
```

> Product images uploaded from the admin are stored in `UPLOAD_DIR` (default
> `./uploads`) and served from `/uploads/products/…` — keep that folder on a
> persistent volume.

Before first launch on a fresh database:

```bash
npx prisma migrate deploy   # apply schema
npm run db:seed             # optional: seed categories + sample products
```

**Pre-launch checklist:** set a strong `AUTH_SECRET`, create the admin with
`npm run db:create-admin`, set `NEXT_PUBLIC_SITE_URL`, fill the contact /
social `NEXT_PUBLIC_*` values, add payment + courier + SMTP credentials, point the
gateway callback URLs at the deployed domain, add real customer reviews (the
testimonials section stays hidden until you do), and remove the `QATEST-` demo
orders (see `docs/AI-HANDOFF.md`).

## Project scope (Standard package)

Responsive luxury design · full store (categories, products, cart, checkout) ·
product search + advanced filters · COD **and** online gateway · full admin +
order management · order confirmation & status · SEO-friendly structure ·
30 days free bug-fixing · training.

---
Developed by **Muhammad Ahmad Waseem** — Frontend Developer & eCommerce Specialist.
