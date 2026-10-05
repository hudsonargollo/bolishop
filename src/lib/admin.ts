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
  } catch (err) {
    console.error("[admin-login] database error:", err);
  }

  return { ok: false };
}

// Signed admin cookie + the admin account must still exist in the DB (so
// deleting/demoting an admin revokes their sessions). If the DB itself is
// unreachable the signed session is accepted — no data can be read or written
// then anyway, and the dashboard shows its "database disconnected" banner.
export async function getVerifiedAdmin(): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: { role: true },
    });
    if (!user) return null;
    return { ...session, role: user.role };
  } catch {
    return session;
  }
}

// Guards admin pages / actions — redirects to login when not authenticated.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getVerifiedAdmin();
  if (!session) redirect("/admin/login");
  return session;
}
