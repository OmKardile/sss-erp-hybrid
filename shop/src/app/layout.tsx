import type { Metadata, Viewport } from "next";
import {
  Unbounded,
  Schibsted_Grotesk,
  Space_Mono,
  Poppins,
} from "next/font/google";
import "./globals.css";
import { STORE_CONFIG } from "@/lib/config";
import { StoreHeader } from "@/components/store-header";
import { FestiveStrip } from "@/components/festive-strip";
import { StoreFooter } from "@/components/store-footer";
import { MobileNav } from "@/components/mobile-nav";
import { Motion } from "@/components/Motion";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Type system (DESIGN.md): Unbounded = the pop display voice,
// Schibsted Grotesk = text/UI, Space Mono = price stickers, hours,
// the bill. Poppins stays for the hard-coded logo wordmark only.
const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700", "900"],
  variable: "--font-unbounded",
});
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space",
});
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
  themeColor: "#f4efe2",
};

// Runs before first paint: hidden-until-revealed styles only apply when
// JS and motion are on (engine contract from the /awwwards skill).
const flags = `document.documentElement.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${schibsted.variable} ${spaceMono.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: flags }} />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div id="curtain" aria-hidden="true">
          <div className="curtain__panel curtain__panel--1" />
          <div className="curtain__panel curtain__panel--2" />
          <div className="curtain__panel curtain__panel--3" />
        </div>
        <div id="loader" role="status" aria-label="Opening the store">
          <div className="loader__inner" data-loader-out>
            <span className="loader__label">SHUBHAM SUPER SHOPEE</span>
            <span className="loader__count" data-loader-count>
              0%
            </span>
          </div>
          <div className="loader__bar" data-loader-bar />
        </div>
        <StoreHeader />
        {/* Festive strip — visible on every page during a festival window. */}
        <FestiveStrip />
        <main id="main" tabIndex={-1} className="flex-1 w-full pb-20 lg:pb-0">
          {children}
        </main>
        <StoreFooter />
        <MobileNav />
        <SpeedInsights />
        {/* Engine adapter — LAST child so page effects register first. */}
        <Motion />
      </body>
    </html>
  );
}
