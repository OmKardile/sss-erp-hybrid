import type { Metadata, Viewport } from "next";
import "./globals.css";
import { STORE_CONFIG } from "@/lib/config";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Home, Package, ShoppingCart } from "lucide-react";

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
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh] flex flex-col bg-white text-slate-900">
        <StoreHeader />
        <main className="flex-1 w-full pb-20 lg:pb-0">{children}</main>
        <StoreFooter />
        <SpeedInsights />
        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden safe-area-pb">
          <a href="/" className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-600">
            <Home className="h-5 w-5" /> Home
          </a>
          <a href="/?category=Groceries" className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-600">
            <Package className="h-5 w-5" /> Shop
          </a>
          <a href="/cart" className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-slate-600">
            <ShoppingCart className="h-5 w-5" /> Cart
          </a>
        </nav>
      </body>
    </html>
  );
}
