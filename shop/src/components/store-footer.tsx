"use client";

import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";
import { BrandLogoMark } from "@/components/brand-logo";
import { useI18n } from "@/components/locale-provider";
import { categoryFor } from "@/lib/i18n";

/**
 * Footer as finale (DESIGN.md): deep ink field, the store name at Unbounded
 * mega size in lime, counter info in Space Mono, real links.
 * Client component since v0.12 — the copy follows the site locale.
 */
export function StoreFooter() {
  const year = new Date().getFullYear();
  const { t, locale } = useI18n();

  return (
    <footer className="mt-auto w-full bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        {/* Counter line */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b border-cream/15 pb-8">
          <p className="font-data text-xs tracking-[0.16em] text-cream/60 uppercase">
            {locale === "mr" ? "काउंटर" : "The counter"}
          </p>
          <p className="sticker sticker--pop font-data text-[11px]">
            {locale === "mr" ? "रोज सकाळी 7 ते रात्री 10" : "OPEN 7 AM TO 10 PM, DAILY"}
          </p>
        </div>

        {/* Giant name — lime pop (brand name stays in its Latin wordmark) */}
        <p
          aria-hidden
          className="font-display mt-10 text-[clamp(2.2rem,7.5vw,6.5rem)] leading-[0.95] text-pop"
          data-reveal="fade"
        >
          Shubham
          <br />
          Super
          <br />
          Shopee
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* The shop */}
          <div>
            <div className="flex items-center gap-3">
              <BrandLogoMark className="h-10 w-10" />
              <p className="font-data text-xs tracking-[0.16em] uppercase text-cream/80">
                {locale === "mr" ? "पुणे, महाराष्ट्र" : "Pune, MH"}
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              {locale === "mr"
                ? "मंडईपासून तुमच्या दारापर्यंत — पुण्यात ताजे किराणा, दुग्धजन्य आणि घरगुती वस्तू. COD किंवा UPI ने पेमेंट करा."
                : "Fresh groceries, dairy and household essentials from the mandi to your doorstep, across Pune. Pay by COD or UPI."}
            </p>
            <a
              href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
              className="link mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-heat px-5 font-data text-xs font-bold text-white"
              aria-label={t("store.call-us")}
            >
              <Phone className="h-3.5 w-3.5" aria-hidden /> {STORE_CONFIG.phone}
            </a>
          </div>

          {/* Shelves */}
          <nav aria-label={t("nav.shop")}>
            <p className="font-data text-xs tracking-[0.16em] text-cream/60 uppercase">
              {locale === "mr" ? "श्रेण्या" : "Shelves"}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-pop">
                  {t("home.shelf-title")}
                </Link>
              </li>
              <li>
                <Link href="/?category=Groceries" className="hover:text-pop">
                  {categoryFor(locale, "Groceries")}
                </Link>
              </li>
              <li>
                <Link href="/?category=Dairy" className="hover:text-pop">
                  {categoryFor(locale, "Dairy")}
                </Link>
              </li>
              <li>
                <Link href="/?category=Snacks" className="hover:text-pop">
                  {categoryFor(locale, "Snacks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/?category=Fruits%20%26%20Vegetables"
                  className="hover:text-pop"
                >
                  {categoryFor(locale, "Fruits & Vegetables")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-pop">
                  {t("header.basket")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Counter info */}
          <div>
            <p className="font-data text-xs tracking-[0.16em] text-cream/60 uppercase">
              {locale === "mr" ? "काउंटर माहिती" : "Counter info"}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-pop" aria-hidden />
                <a
                  href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
                  className="hover:text-pop"
                >
                  {STORE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pop" aria-hidden />
                <span>
                  {locale === "mr"
                    ? "पुणे, महाराष्ट्र, भारत"
                    : STORE_CONFIG.address}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-pop" aria-hidden />
                <span className="font-data text-[13px]">
                  {locale === "mr"
                    ? "रोज सकाळी 7:00 ते रात्री 10:00"
                    : "7:00 AM to 10:00 PM, daily"}
                </span>
              </li>
            </ul>
          </div>

          {/* Delivery */}
          <div>
            <p className="font-data text-xs tracking-[0.16em] text-cream/60 uppercase">
              {locale === "mr" ? "डिलिव्हरी" : "Delivery"}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
              <li>{t("marquee.2")}</li>
              <li>{t("cart.pay-note", { n: 500 })}</li>
              <li>{t("marquee.3")}</li>
              <li>{locale === "mr" ? "24 तासांत सुलभ परतावा" : "Easy returns within 24 hours"}</li>
            </ul>
          </div>
        </div>

        {/* Small print */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/55 sm:flex-row sm:items-center">
          <p>
            © {year} {STORE_CONFIG.name}.{" "}
            {locale === "mr" ? "सर्व हक्क राखीव." : "All rights reserved."}
          </p>
          <p className="flex flex-wrap items-center gap-1.5">
            {locale === "mr" ? (
              <>
                डिझाइन व विकास{" "}
                <a
                  href="https://omkardile.is-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-pop underline-offset-2 hover:underline"
                >
                  Omkar Kardile
                </a>
              </>
            ) : (
              <>
                Designed &amp; developed by{" "}
                <a
                  href="https://omkardile.is-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-pop underline-offset-2 hover:underline"
                >
                  Omkar Kardile
                </a>
                · Set in Unbounded &amp; Space Mono
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
