"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getDefaultTenantId } from "@/lib/tenant";

export async function toggleMessageHandled(id: string, handled: boolean): Promise<void> {
  await requireAdmin();
  const tenantId = (await getDefaultTenantId()) ?? "";
  try {
    await prisma.contactMessage.updateMany({ where: { id, tenantId }, data: { handled } });
  } catch (err) {
    console.error("[admin] could not update message:", err);
  }
  revalidatePath("/admin/messages");
}
