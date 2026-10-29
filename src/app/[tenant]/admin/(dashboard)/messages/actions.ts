"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { actionTenantId, requireAdmin } from "@/lib/admin";

export async function toggleMessageHandled(id: string, handled: boolean): Promise<void> {
  await requireAdmin();
  const tenantId = (await actionTenantId()) ?? "";
  try {
    await prisma.contactMessage.updateMany({ where: { id, tenantId }, data: { handled } });
  } catch (err) {
    console.error("[admin] could not update message:", err);
  }
  revalidatePath("/", "layout");
}
