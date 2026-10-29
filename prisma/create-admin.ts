import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

// Creates (or updates) the admin user in the database, reading credentials
// from ADMIN_EMAIL / ADMIN_PASSWORD in .env. Run with:
//   npm run db:create-admin
// To change the password later: edit ADMIN_PASSWORD in .env and re-run.

// Must match hashPassword() in src/lib/password.ts (scrypt, salt:hash, 64 bytes).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("✖ Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
    process.exit(1);
  }

  // Every User row belongs to a tenant (unique per tenant+email). The admin is
  // created under the default tenant (DEFAULT_TENANT_SLUG in .env, else zariera),
  // which is created on the spot when missing.
  const slug = process.env.DEFAULT_TENANT_SLUG || "zariera";
  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: slug,
      displayName: process.env.STORE_NAME || "ZARIERA",
    },
    select: { id: true },
  });

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    update: { passwordHash: hashPassword(password), role: "ADMIN" },
    create: {
      email,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      name: "Admin",
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Admin ready in database: ${user.email} (role ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
