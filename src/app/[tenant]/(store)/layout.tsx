import { ConditionalHeader } from "@/components/conditional-header";
import { ConditionalFooter } from "@/components/conditional-footer";
import { SupportChat } from "@/components/support-chat";
import { getStoreSettings, renderAnnouncements } from "@/lib/settings";
import { requireTenant } from "@/lib/tenant";

// Store-wide settings (Admin → Settings) are loaded once here and passed to the
// client-side header / footer / chat — always of the tenant in the URL.
export default async function StoreLayout({
  children,
  params,
}: LayoutProps<"/[tenant]">) {
  const { tenant: tenantSlug } = await params;
  const tenant = await requireTenant(tenantSlug);
  const settings = await getStoreSettings(tenant.id);
  return (
    <>
      <ConditionalHeader announcements={renderAnnouncements(settings)} />
      <main className="flex-1">{children}</main>
      <ConditionalFooter settings={settings} />
      <SupportChat settings={settings} />
    </>
  );
}
