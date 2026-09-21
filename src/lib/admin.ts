import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { verifyPassword, getAdminSession, type AdminSession } from "./auth";

// Verifies admin credentials against the database `User` table.
// Admins are created/updated with `npm run db:create-admin` (reads
// ADMIN_EMAIL / ADMIN_PASSWORD from .env and stores a hashed password).
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ ok: true; role: string } | { ok: false }> {
  const e = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: e } });
    if (user && verifyPassword(password, user.passwordHash)) {
      return { ok: true, role: user.role };
    }
  } catch {
    /* DB unavailable */
  }

  return { ok: false };
}

// Guards admin pages — redirects to login when not authenticated.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
