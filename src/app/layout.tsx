import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ZARIERA — Every Jewel Tells a Story",
    template: "%s · ZARIERA",
  },
  description:
    "ZARIERA — premium stainless steel & artificial jewelry. Elegant, gold-plated, rust-free and hypoallergenic pieces made to last.",
  keywords: [
    "ZARIERA",
    "stainless steel jewelry",
    "artificial jewelry",
    "gold-plated jewelry",
    "necklaces",
    "rings",
    "earrings",
    "artificial jewelry Pakistan",
    "hypoallergenic jewelry",
  ],
  applicationName: "ZARIERA",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ZARIERA — Every Jewel Tells a Story",
    description: "Premium stainless steel & artificial jewelry — elegant, gold-plated, made to last.",
    type: "website",
    siteName: "ZARIERA",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZARIERA — Every Jewel Tells a Story",
    description: "Premium stainless steel & artificial jewelry — elegant, gold-plated, made to last.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
