import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_SLUG = process.argv[2];
const TENANT_NAME = process.argv[3];

function usage() {
  console.log("Usage: npm run db:create-tenant <slug> <display-name>");
  console.log("Example: npm run db:create-tenant moestore \"Moe's Store\"");
  process.exit(1);
}

async function main() {
  if (!TENANT_SLUG || !TENANT_NAME) usage();

  const slug = TENANT_SLUG.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) {
    console.error("Invalid slug.");
    process.exit(1);
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    console.error(`Tenant "${slug}" already exists.`);
    process.exit(1);
  }

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name: TENANT_NAME,
      displayName: TENANT_NAME,
      tagline: "",
      currency: "PKR",
      active: true,
    },
  });

  // Seed default settings.
  await prisma.setting.create({
    data: {
      tenantId: tenant.id,
      key: "store",
      value: {
        contact: { email: "", phone: "", whatsapp: "", city: "", hours: "" },
        social: { instagram: "", facebook: "", tiktok: "" },
        shipping: { flatFee: 0, freeThreshold: 0, deliveryTime: "" },
        announcements: [],
        inventory: { lowStockThreshold: 5 },
        notifications: { orderEmail: "" },
      } as any,
    },
  });

  console.log(`✔ Created tenant "${slug}" (${tenant.id})`);
  console.log(`  URL: /${slug}`);
  console.log(`  Admin: /${slug}/admin/login`);
  console.log(`  Currency: PKR`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
