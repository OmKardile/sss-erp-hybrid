import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shubham Super Shopee ERP — Retail Operations Suite",
  description:
    "A modern retail ERP for single-shop operations: inventory, purchases, income, expenses, udhar credit ledger, customers & suppliers.",
  keywords: [
    "ERP",
    "Retail",
    "Inventory",
    "Udhar",
    "Shop Management",
    "Shubham Super Shopee",
  ],
  authors: [{ name: "Omkar Kardile", url: "https://omkardile.is-a.dev/" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
