# ZARIERA — Vercel deploy guide

The project deploys on Vercel as-is (the GitHub repo is already connected). Do these once.

> **Plan note:** Vercel's free *Hobby* plan is for non-commercial use. Fine for a demo; a live
> store selling products needs **Pro**. (Netlify's free plan has no such restriction — see
> `docs/DEPLOY-NETLIFY.md`.)

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

Add for **Production** (and Preview if you use it). Then **Redeploy** — env changes only apply
to new deployments, and `NEXT_PUBLIC_*` values are baked in at build time.

| Name | Value |
|------|-------|
| `DATABASE_URL` | Neon **pooled** URL (host has `-pooler`) + `?sslmode=require&pgbouncer=true&connection_limit=1` — **remove `&channel_binding=require`** |
| `DIRECT_URL` | Same URL **without** `-pooler`, with `?sslmode=require` |
| `AUTH_SECRET` | New random value: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://zariera.vercel.app` (no trailing slash) |
| `COURIER_SIMULATION` | `true` for the demo (demo tracking numbers) |
| socials / email | as in `netlify.env.example` (or set them later in Admin → Settings) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | **Required for sign-up** — new customers get a 6-digit email code before the account is created. Gmail: `smtp.gmail.com`, `587`, the Gmail address, a 16-char **App Password** (Google Account → Security → 2-Step Verification → App passwords), `ZARIERA <that address>`. Without SMTP, registration on the live site shows "We can't send verification emails right now". |
| `ANTHROPIC_API_KEY` | (Secret) Claude API key for the AI support chat — console.anthropic.com → API Keys. Without it the chat uses basic answers. |

**Never** paste the local `.env` — its `DATABASE_URL` points to `localhost`, which Vercel can't reach
(that causes "Could not create your account").

## 2. Database (Neon) — already done

The Neon DB already has all tables (9 migrations, incl. `email_otp`) and the store data. For a fresh Neon DB:

```bash
DATABASE_URL="DIRECT_NEON_URL" DIRECT_URL="DIRECT_NEON_URL" npx prisma migrate deploy
SOURCE_DATABASE_URL="LOCAL_URL" TARGET_DATABASE_URL="DIRECT_NEON_URL" npm run db:copy
DATABASE_URL="DIRECT_NEON_URL" DIRECT_URL="DIRECT_NEON_URL" ADMIN_EMAIL="admin@zariera.com" ADMIN_PASSWORD="strong-password" npm run db:create-admin
```

Future schema changes: run the `migrate deploy` line above before/after deploying (Vercel's build
doesn't run migrations).

## 3. Image uploads (Vercel Blob)

Vercel → **Storage → Create Database → Blob** → name it `zariera-uploads` → **Connect to project**
(all environments). Vercel adds `BLOB_STORE_ID` (OIDC — current default) and, if the
"read-write token" box is ticked, `BLOB_READ_WRITE_TOKEN`; the app works with either. **Redeploy.**
Without it, admin image upload shows "Image uploads on Vercel need a Blob store".

## 4. Check the deployment

Open **`https://YOUR-SITE.vercel.app/api/health`**. `"ok": true` = all good. Otherwise the
`warnings` list says exactly what's wrong (DB URL, missing tables, AUTH_SECRET, Blob store).
It never shows passwords.

Vercel → Project → **Logs** shows the real error behind any failure (look for `[register]`,
`[login]`, `[catalog] DATABASE UNAVAILABLE`, `[health]`).

## 5. Deployment Protection

By default Vercel protects deployment URLs (visitors must log in to Vercel). For the client demo:
Project → Settings → **Deployment Protection** → turn off *Vercel Authentication* for Production
(or share the production domain, which is public).
