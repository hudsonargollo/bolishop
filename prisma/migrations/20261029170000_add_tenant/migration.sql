-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tagline" TEXT,
    "publicUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "logo" TEXT,
    "brandColor" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Unique index
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- Seed default tenant
INSERT INTO "Tenant" ("id", "slug", "name", "displayName") VALUES ('zariera', 'zariera', 'ZARIERA', 'ZARIERA');

-- Add tenantId columns
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "ContactMessage" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'zariera';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Unique constraints
CREATE UNIQUE INDEX "Category_tenantId_slug_key" ON "Category"("tenantId", "slug");
CREATE UNIQUE INDEX "Customer_tenantId_email_key" ON "Customer"("tenantId", "email");
CREATE UNIQUE INDEX "Order_tenantId_orderNumber_key" ON "Order"("tenantId", "orderNumber");
CREATE UNIQUE INDEX "Product_tenantId_slug_key" ON "Product"("tenantId", "slug");
CREATE UNIQUE INDEX "Product_tenantId_sku_key" ON "Product"("tenantId", "sku");
CREATE UNIQUE INDEX "Setting_tenantId_key_key" ON "Setting"("tenantId", "key");
CREATE UNIQUE INDEX "Subscriber_tenantId_email_key" ON "Subscriber"("tenantId", "email");
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- Foreign keys
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
