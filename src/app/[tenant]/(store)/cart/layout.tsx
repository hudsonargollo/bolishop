import type { Metadata } from "next";

// The cart page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Shopping Bag",
  robots: { index: false },
};

export default function CartLayout({ children }: LayoutProps<"/[tenant]/cart">) {
  return children;
}
