import { ConditionalHeader } from "@/components/conditional-header";
import { ConditionalFooter } from "@/components/conditional-footer";
import { SupportChat } from "@/components/support-chat";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConditionalHeader />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
      <SupportChat />
    </>
  );
}
