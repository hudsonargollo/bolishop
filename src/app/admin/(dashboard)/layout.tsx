import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
