# ZARIERA — Netlify deploy guide (client demo)

Step-by-step. Roman Urdu hints in *italics*. Takes ~20–30 minutes the first time.

> **What you need:** a GitHub account (repo `mian76951-ui/zariera_project` already exists),
> a free **Netlify** account, and a free cloud **PostgreSQL** database (**Neon**, or Netlify's
> built-in "Netlify DB", which is Neon too). Your local database stays on your PC — Netlify
> can't reach it, so the data is copied to the cloud DB in step 2.

---

## 1. Push the latest code to GitHub

*Saari nayi files GitHub par honi chahiye, warna deploy mein nahi aayengi.*

```bash
git add -A
git commit -m "Netlify-ready: fixes, socials, optimized images"
git push
```

Check on GitHub that `public/images/...`, `prisma/migrations/...`, `netlify.toml` and
`netlify.env.example` are there. (`.env` is **not** uploaded — correct, it holds secrets.)

## 2. Create the cloud database and copy your data

1. Go to <https://neon.tech> → sign up → **Create project** (region: closest to Pakistan,
   e.g. *Singapore* or *Frankfurt*).
2. In Neon → **Connect**, copy two strings:
   - **Pooled** (host contains `-pooler`) → this becomes `DATABASE_URL` on Netlify, with
     `&pgbouncer=true&connection_limit=1` added at the end.
   - **Direct** (toggle "Connection pooling" off, no `-pooler`) → this is `DIRECT_URL`,
     and also the `CLOUD_URL` used in the commands below.
3. On your PC, in the project folder, run (replace `CLOUD_URL` with the **direct** string):

```bash
# a) create all tables in the cloud DB
DATABASE_URL="CLOUD_URL" DIRECT_URL="CLOUD_URL" npx prisma migrate deploy

# b) copy products, categories, admin, customers, orders… from your local DB
SOURCE_DATABASE_URL="postgresql://postgres:YOURPASS@localhost:5432/zariera?schema=public" TARGET_DATABASE_URL="CLOUD_URL" npm run db:copy

# c) set a STRONG admin password on the cloud DB (the local one is weak)
DATABASE_URL="CLOUD_URL" DIRECT_URL="CLOUD_URL" ADMIN_EMAIL="admin@zariera.com" ADMIN_PASSWORD="choose-a-strong-password" npm run db:create-admin
```

*(PowerShell mein ye `VAR=value command` style nahi chalta — Git Bash use karein, ya
PowerShell mein pehle `$env:DATABASE_URL="CLOUD_URL"` likh kar phir command chalayein.)*

`db:copy` is safe to run again — it never deletes and skips rows that already exist.

## 3. Create the Netlify site

1. <https://app.netlify.com> → **Add new site → Import an existing project → GitHub** →
   pick `zariera_project`.
2. Build settings are read from `netlify.toml` automatically — leave them as they are
   (build command `npx prisma migrate deploy && npm run build`, Node 22, Next.js runtime).
3. **Before the first deploy** open **Site configuration → Environment variables →
   Import from a .env file** and paste the contents of `netlify.env.example` with your
   values:
   - `DATABASE_URL` = Neon **pooled** URL + `&pgbouncer=true&connection_limit=1`
   - `DIRECT_URL` = Neon **direct** URL (no `-pooler`)
   - `AUTH_SECRET` = a NEW long random value:
     `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - `NEXT_PUBLIC_SITE_URL` = your site URL (you'll know it after step 4 — e.g.
     `https://zariera.netlify.app`; you can rename the site under *Site configuration → Change site name*)
   - socials / email are pre-filled in the template
   - `COURIER_SIMULATION="true"` so "Book shipment" works in the demo
4. **Deploy site**. First build takes ~3–5 minutes.
5. If you set `NEXT_PUBLIC_SITE_URL` after the first deploy: **Deploys → Trigger deploy →
   Clear cache and deploy site** (that value is baked in at build time).

## 4. Demo checklist (open the live URL)

- Home, Shop, a product page, Cart → Checkout (COD) → order placed → **Track Order**
- Register / Sign in / Forgot password page opens
- Contact form → message appears in **Admin → Messages**
- `/admin/login` with the strong password from step 2c → Dashboard, Orders (change status,
  Book shipment → demo tracking no.), Products (add / edit, **image upload**), Categories
- Footer icons → Instagram / Facebook / TikTok open; Email copies the address

## Notes for the demo

- **Online payments** (PayFast/Safepay) stay hidden until their keys are added → only COD shows.
- **Emails** (order confirmation, password reset) need SMTP settings — until then they are
  skipped silently; contact messages are still saved in Admin → Messages.
- **Uploads**: on Netlify, admin-uploaded images are stored in **Netlify Blobs** automatically
  (no setup). Existing product photos come from `public/images`.
- **Live order bell**: works on Netlify by checking for new orders every few seconds.
- **Speed**: Netlify free tier is fine for a demo; the first visit after idle can take 1–3 s
  (cold start). For launch a paid plan or VPS is faster.
- **Before going live** (not for the demo): replace sample reviews, confirm prices/sale
  prices and the free-shipping threshold, add WhatsApp/phone, SMTP, payment + courier keys,
  remove `COURIER_SIMULATION`, delete `QATEST-` demo orders. See `docs/AI-HANDOFF.md`.

## If the build fails

- *"Can't reach database server"* → `DATABASE_URL` missing/wrong in Netlify env vars, or
  missing `?sslmode=require`.
- *"AUTH_SECRET must be set"* → add `AUTH_SECRET` (16+ chars).
- *"Query engine library … rhel-openssl-3.0.x not found"* → make sure `prisma/schema.prisma`
  has `binaryTargets = ["native", "rhel-openssl-3.0.x"]` (it does) and redeploy with
  *Clear cache and deploy site*.
