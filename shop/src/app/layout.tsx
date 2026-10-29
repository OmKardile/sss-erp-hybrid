import type { Metadata, Viewport } from "next";
import { Fraunces, Bricolage_Grotesque, Poppins } from "next/font/google";
import "./globals.css";
import { STORE_CONFIG } from "@/lib/config";
import { StoreHeader } from "@/components/store-header";
import { FestiveStrip } from "@/components/festive-strip";
import { StoreFooter } from "@/components/store-footer";
import { MobileNav } from "@/components/mobile-nav";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Display faces — Bricolage Grotesque (chunky, contemporary) for
// headlines + Fraunces italic for editorial accent words.
// Self-hosted by next/font (no runtime requests to Google).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
  style: ["normal", "italic"],
});
// Brand wordmark face — the hard-coded inline logo (brand-logo.tsx)
// typesets "Shubham / Super Shopee" in Poppins for pixel-true rendering
// on every device (no system-font roulette).
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "800"],
  variable: "--font-poppins",
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
  themeColor: "#FFF9F0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${fraunces.variable} ${poppins.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-[100dvh] flex flex-col bg-transparent text-stone-900">
        {/* Ambient backdrop — a vivid sunlit color field the glass
            surfaces refract. Fixed + pointer-events-none: zero scroll
            cost, never intercepts. Saturated market hues. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fff9f0]"
        >
          <div className="absolute -top-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-emerald-300/45 blur-[110px]" />
          <div className="absolute top-[24%] left-[-14%] h-[28rem] w-[28rem] rounded-full bg-amber-300/50 blur-[110px]" />
          <div className="absolute top-[8%] left-[30%] h-[20rem] w-[20rem] rounded-full bg-lime-300/35 blur-[110px]" />
          <div className="absolute bottom-[-14%] right-[8%] h-[30rem] w-[30rem] rounded-full bg-rose-300/40 blur-[110px]" />
          <div className="absolute top-[55%] left-[24%] h-[22rem] w-[22rem] rounded-full bg-sky-300/35 blur-[110px]" />
          <div className="absolute top-[72%] right-[32%] h-[18rem] w-[18rem] rounded-full bg-orange-300/40 blur-[110px]" />
        </div>
        {/* Film grain — premium texture over the whole composition */}
        <div aria-hidden className="grain" />
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
