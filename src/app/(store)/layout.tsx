import { ConditionalHeader } from "@/components/conditional-header";
import { ConditionalFooter } from "@/components/conditional-footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConditionalHeader />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
    </>
  );
}
