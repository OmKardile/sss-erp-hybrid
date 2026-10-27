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
  metadataBase: new URL("https://sss-ecommerce.vercel.app"),
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
  openGraph: {
    title: `${STORE_CONFIG.name} — Fresh groceries delivered in Pune`,
    description:
      "Groceries, dairy, snacks and household essentials delivered to your doorstep across Pune. COD & UPI accepted.",
    type: "website",
    siteName: STORE_CONFIG.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: STORE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${STORE_CONFIG.name} — Fresh groceries delivered in Pune`,
    description:
      "Groceries, dairy, snacks and household essentials delivered to your doorstep across Pune.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#03291f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={fraunces.variable}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-[100dvh] flex flex-col bg-transparent text-stone-900">
        {/* Ambient backdrop — soft color fields the glass surfaces refract.
            Fixed + pointer-events-none: zero scroll cost, never intercepts. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#faf9f7]"
        >
          <div className="absolute -top-44 right-[-14%] h-[30rem] w-[30rem] rounded-full bg-emerald-300/30 blur-[110px]" />
          <div className="absolute top-[28%] left-[-16%] h-[27rem] w-[27rem] rounded-full bg-amber-200/45 blur-[110px]" />
          <div className="absolute bottom-[-12%] right-[14%] h-[26rem] w-[26rem] rounded-full bg-emerald-200/40 blur-[110px]" />
          <div className="absolute top-[58%] left-[28%] h-[19rem] w-[19rem] rounded-full bg-rose-100/40 blur-[110px]" />
        </div>
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
