import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { STORE_CONFIG } from "@/lib/config";
import { StoreHeader } from "@/components/store-header";
import { FestiveStrip } from "@/components/festive-strip";
import { StoreFooter } from "@/components/store-footer";
import { MobileNav } from "@/components/mobile-nav";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Expressive display face — used for headlines & editorial moments.
// Self-hosted by next/font (no runtime requests to Google).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: `${STORE_CONFIG.name} — Fresh groceries delivered in Pune`,
  description:
    "Order groceries, dairy, snacks and household items online from Shubham Super Shopee. Fast delivery across Pune.",
  keywords: [
    "grocery",
    "Pune",
    "online grocery",
    "Shubham Super Shopee",
    "delivery",
  ],
  authors: [{ name: "Omkar Kardile", url: "https://omkardile.is-a.dev/" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#065f46",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="min-h-[100dvh] flex flex-col bg-white text-stone-900">
        <StoreHeader />
        {/* Festive strip — visible on every page during a festival window.
            Scrolls away naturally; header stays h-14 so sticky offsets
            elsewhere (top-14/sm:top-16) are unaffected. */}
        <FestiveStrip />
        <main className="flex-1 w-full pb-20 lg:pb-0">{children}</main>
        <StoreFooter />
        <MobileNav />
        <SpeedInsights />
      </body>
    </html>
  );
}
