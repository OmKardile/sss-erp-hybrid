"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown, Plus, Loader2, PackageX } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { ScrollToTop } from "@/components/scroll-to-top";
import { DealCountdown } from "@/components/countdown";
import { AnimatedIcon } from "@/components/animated-icon";
import {
  DEFAULT_CATEGORIES,
  STORE_CONFIG,
  CATEGORY_IMAGE,
} from "@/lib/config";
import { istDateStr } from "@/lib/festive";
import { useActiveTheme } from "@/lib/use-active-theme";
import { pickDailyDeal, discountPct } from "@/lib/deal";
import { formatCurrency } from "@/lib/utils";
import { resolveProductImage as resolveProductImageSafe } from "@/lib/config";
import { useI18n } from "@/components/locale-provider";
import { categoryFor, festiveFor } from "@/lib/i18n";
import { ensureNames, useMrName, useMrNamesMap } from "@/lib/mr-names";
import improvementState from "@/config/improvement-state.json";
import type { ProductListItem } from "@/lib/types";

/**
 * Home — Fresh Cart (DESIGN.md, v0.11). The color-field journey:
 * cream hero → lime marquee → white stalls → coral deal → cream index →
 * white shelf → pine promise. Motion from the engine's data attributes;
 * marquee + index preview registered in src/motion/setup.ts.
 * Full Marathi support since v0.12 (one-click, chrome + catalog).
 */

const MARKET_CRIES = [
  "marquee.1",
  "marquee.2",
  "marquee.3",
  "marquee.4",
] as const;

export default function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  const theme = useActiveTheme();
  const { t, locale } = useI18n();
  const isMarathi = locale === "mr";
  const mrMap = useMrNamesMap();
  const fest = useMemo(
    () => (theme ? festiveFor(theme, locale) : null),
    [theme, locale],
  );
  // Locale helpers: categories resolve instantly via CATEGORY_MR; other DB
  // strings go through the shared mr-map; the sticker splits once per render.
  const catLabel = (c: string) => categoryFor(locale, c);
  const mr = (s: string) => (isMarathi ? mrMap.get(s) ?? s : s);
  const stickerParts = t("hero.sticker").split(" · ");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("category");
    if (q) setQuery(q);
    if (cat) setActiveCat(cat);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) {
          let msg = t("home.error-load");
          try {
            const body = await res.json();
            if (body?.hint) msg = body.hint;
            else if (body?.error) msg = body.error;
          } catch {
            /* not JSON */
          }
          throw new Error(msg);
        }
        const data = await res.json();
        if (!mounted) return;
        setProducts(data.items || []);
        if (data.categories?.length) {
          setCategories(["All", ...data.categories.filter(Boolean)] as string[]);
        }
        setError(null);
      } catch (e: any) {
        setError(e?.message || t("home.error-load"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && !error && products.length === 0 && !seeded) {
      setSeeded(true);
      (async () => {
        try {
          await fetch("/api/seed", { method: "POST" });
          const res = await fetch("/api/products", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setProducts(data.items || []);
            if (data.categories?.length) {
              setCategories([
                "All",
                ...data.categories.filter(Boolean),
              ] as string[]);
            }
          }
        } catch {
          /* ignore */
        }
      })();
    }
  }, [loading, products.length, seeded]);

  // Queue every catalog string for Marathi translation (names, brands,
  // categories, units) so cards, the deal, the index AND the search all
  // speak Marathi (search also matches the translated names below).
  useEffect(() => {
    if (!isMarathi || products.length === 0) return;
    ensureNames([
      ...products.map((p) => p.name),
      ...products.map((p) => p.unitType).filter(Boolean),
      ...products.map((p) => p.brand).filter((b): b is string => !!b),
      ...categories.filter((c) => c !== "All"),
    ]);
  }, [isMarathi, products, categories]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== "All") {
      list = list.filter((p) => p.category === activeCat);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (mrMap.get(p.name) ?? "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          categoryFor("mr", p.category || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, activeCat, query, mrMap]);

  const featured = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 8),
    [products],
  );

  const deal = useMemo(() => {
    const pinned = (improvementState as any)?.deal?.slug as string | undefined;
    if (pinned) {
      const p = products.find((x) => x.slug === pinned && x.stock > 0);
      if (p) return p;
    }
    return pickDailyDeal(products, istDateStr());
  }, [products]);

  const dealImage = deal
    ? resolveProductImageSafe(deal.image, deal.category)
    : null;
  const heroImage = theme?.heroImage || "/products/market-sunlit.jpg";
  const tileCategories = categories.filter((c) => c !== "All");

  return (
    <div className="w-full">
      {/* ═══ HERO — mega type + floating product stickers ═══ */}
      <section className="relative">
        {/* ambient color blobs — the market glow (clipped to their own
            layer so the sticker overhang never gets cut) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-pop/40 blur-[90px]" />
          <div className="absolute -right-16 top-1/4 h-72 w-72 rounded-full bg-heat/20 blur-[90px]" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-mango/30 blur-[80px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-24 lg:pt-20">
          {/* Type stack */}
          <div>
            <p
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-data text-[11px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_6px_18px_rgb(14_27_18/0.08)]"
              data-reveal="up"
              data-intro
            >
              <span className="h-2 w-2 rounded-full bg-heat" aria-hidden />
              {fest ? fest.kicker : t("hero.kicker")}
            </p>

            <h1
              className="font-display mt-6 text-[clamp(2.6rem,9vw,6.2rem)]"
              data-reveal="clip"
              data-intro
              data-delay="0.12"
            >
              {fest ? (
                fest.headline.split("\n").map((line, i) => (
                  <span
                    key={i}
                    className={i === 1 ? "block text-heat" : "block"}
                  >
                    {line}
                  </span>
                ))
              ) : (
                <>
                  <span className="block">{t("hero.line1")}</span>
                  <span className="block text-pop-deep">{t("hero.line2")}</span>
                  <span className="block">
                    {t("hero.line3a")}{" "}
                    <span className="text-heat">{t("hero.line3b")}</span>
                  </span>
                </>
              )}
            </h1>

            <p
              className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/75 sm:text-base"
              data-reveal="up"
              data-intro
              data-delay="0.24"
            >
              {fest
                ? fest.subline
                : t("hero.subline", { name: STORE_CONFIG.name })}
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-3"
              data-reveal="up"
              data-intro
              data-delay="0.34"
            >
              <a
                href="#shop"
                className="pop-btn inline-flex h-12 items-center gap-2 px-7 text-sm font-bold"
              >
                {t("hero.cta-shop")}
                <ArrowRight className="arrow h-4 w-4" aria-hidden />
              </a>
              <a
                href="#deal"
                className="pop-btn pop-btn--ghost inline-flex h-12 items-center gap-2 px-6 text-sm font-bold"
              >
                {t("hero.cta-deal")}
                <ArrowDown className="arrow arrow--down h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>

          {/* Photo cluster + bobbing stickers */}
          <div className="relative" data-reveal="scale" data-intro data-delay="0.2">
            <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-white shadow-glow-ink">
              <img
                src={heroImage}
                alt={
                  fest
                    ? t("hero.fest-alt", {
                        festival: fest.festival,
                        name: STORE_CONFIG.name,
                      })
                    : t("hero.img-alt", { name: STORE_CONFIG.name })
                }
                data-critical
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between rounded-t-2xl bg-ink/70 px-5 py-3 font-data text-[11px] font-bold uppercase tracking-[0.12em] text-cream backdrop-blur-md">
                <span>{fest ? fest.badgeLabel : t("hero.badge")}</span>
                <span className="text-pop">{t("hero.badge-today")}</span>
              </div>
            </div>

            {/* Bobbing product stickers (idle state) — inside bounds so
                nothing clips; the overflow lives on the blob layer only */}
            <div className="bob absolute left-6 top-12" aria-hidden>
              <img
                src="/products/tomato.jpg"
                alt=""
                className="h-20 w-20 rounded-full border-[3px] border-white object-cover shadow-glow-heat sm:h-24 sm:w-24"
              />
            </div>
            <div
              className="bob absolute bottom-16 right-3"
              style={{ animationDelay: "1.2s" }}
              aria-hidden
            >
              <img
                src="/products/banana.jpg"
                alt=""
                className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-glow-pop sm:h-20 sm:w-20"
              />
            </div>
            <div
              className="bob absolute right-8 top-8"
              style={{ animationDelay: "2.1s" }}
              aria-hidden
            >
              <span className="sticker sticker--heat text-[11px]">
                {fest ? fest.festival : stickerParts[0]} · {stickerParts[1]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE — lime band, market cries ═══ */}
      <div
        className="border-y-[3px] border-ink bg-pop py-3.5 text-ink"
        aria-hidden="true"
        data-marquee
      >
        <div data-track>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {MARKET_CRIES.map((cry) => (
                <span
                  key={cry + copy}
                  className="font-display flex items-center gap-6 pr-6 text-lg font-bold sm:text-xl"
                >
                  {t(cry)}
                  <span className="h-2.5 w-2.5 rounded-full bg-heat" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORIES — the stalls ═══ */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl sm:text-4xl" data-reveal="up">
            {t("home.stalls-title")}
          </h2>
          <p className="font-data text-xs text-sage">
            {t("home.items-in-store", { n: products.length })}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-12">
          {tileCategories.map((cat, i) => {
            const span = (
              i === 0 ? "col-span-2 aspect-[16/10] lg:col-span-7 lg:aspect-[16/9]"
              : i === 1 ? "col-span-2 aspect-[16/10] lg:col-span-5 lg:aspect-[16/9]"
              : i < 6 ? "aspect-square lg:col-span-3"
              : "aspect-[16/10] lg:col-span-6"
            );
            return (
              <a
                key={cat}
                href="#shop"
                onClick={() => {
                  setActiveCat(cat);
                }}
                aria-label={t("home.shop-category", { cat: catLabel(cat) })}
                data-reveal="up"
                data-delay={`${(i % 4) * 0.06}`}
                className={`candy-card group relative block overflow-hidden !rounded-[1.5rem] ${span}`}
              >
                <img
                  src={CATEGORY_IMAGE[cat] || CATEGORY_IMAGE["Groceries"]!}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 p-3.5 sm:p-4">
                  <span className="font-display text-lg leading-none text-white sm:text-xl">
                    {catLabel(cat)}
                  </span>
                  <span className="rounded-full bg-pop px-2.5 py-1 font-data text-[10px] font-bold text-ink">
                    {products.filter((p) => p.category === cat).length}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ═══ DEAL — coral field, giant price ═══ */}
      {deal && (
        <section
          id="deal"
          className="mt-16 scroll-mt-24 bg-heat px-4 py-14 sm:mt-24 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <p className="font-data text-xs font-bold tracking-[0.18em] text-white/85 uppercase">
              {t("deal.kicker")}
            </p>
            <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
              {/* Photo on white card */}
              <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-white shadow-[0_20px_50px_rgb(0_0_0/0.25)]" data-reveal="scale">
                <img
                  src={dealImage || ""}
                  alt={mr(deal.name)}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
                />
                {discountPct(deal) > 0 && (
                  <span className="sticker absolute left-4 top-4 text-sm">
                    −{discountPct(deal)}%
                  </span>
                )}
              </div>

              {/* Facts on coral */}
              <div className="text-ink">
                <h2 className="font-display text-3xl leading-[1] sm:text-4xl lg:text-5xl" data-reveal="up">
                  {mr(deal.name)}
                </h2>

                <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
                  <p className="font-display text-[clamp(3.2rem,9vw,6rem)] leading-[0.9] text-white">
                    {formatCurrency(deal.price)}
                  </p>
                  {deal.compareAtPrice && (
                    <p className="sticker mb-3 self-center">
                      <s>{formatCurrency(deal.compareAtPrice)}</s>{" "}
                      {discountPct(deal)}{t("deal.off")}
                    </p>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <DealAddButton product={deal} />
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 font-data text-xs font-bold text-heat">
                    {t("deal.ends-in")}{" "}
                    <DealCountdown variant="compact" className="text-ink" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ FEATURED — the index list ═══ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl" data-reveal="up">
              {fest ? fest.sectionTitle : t("home.picks-title")}
            </h2>
            <a href="#shop" className="link hidden text-sm font-semibold sm:inline-flex">
              {fest ? fest.sectionSub : t("home.picks-sub")}
            </a>
          </div>

          <ul className="mt-8" data-index>
            {featured.map((p, i) => (
              <li key={p.id} data-reveal="up" data-delay={`${i * 0.04}`}>
                <div className="index-row">
                  <Link
                    href={`/product/${p.slug}`}
                    className="group flex min-w-0 items-center gap-4"
                    data-preview={
                      resolveProductImageSafe(p.image, p.category) || ""
                    }
                  >
                    <img
                      src={resolveProductImageSafe(p.image, p.category) || ""}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-2xl border-[1.5px] border-ink/10 object-cover lg:hidden"
                    />
                    <span className="font-display truncate text-lg leading-none transition-colors group-hover:text-heat sm:text-xl lg:text-2xl">
                      {mr(p.name)}
                    </span>
                  </Link>
                  <p className="hidden font-data text-xs text-sage sm:block">
                    {mr(p.category)} · {mr(p.unitType)}
                  </p>
                  <span className="sticker">{formatCurrency(p.price)}</span>
                  <MiniAdd product={p} />
                </div>
              </li>
            ))}
          </ul>
          <div className="index-preview" aria-hidden="true">
            <img alt="" />
          </div>
        </section>
      )}

      {/* ═══ THE SHELF — filter pills + candy grid ═══ */}
      <section id="shop" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl sm:text-4xl" data-reveal="up">
            {t("home.shelf-title")}
          </h2>
          {(query.trim() || activeCat !== "All") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCat("All");
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("q");
                  url.searchParams.delete("category");
                  window.history.replaceState({}, "", url);
                }
              }}
              className="link font-data text-xs text-sage"
            >
              {t("home.clear-filters")}
            </button>
          )}
        </div>

        {/* Filter pills (sticky) */}
        <div className="sticky top-14 z-30 -mx-4 mt-6 bg-cream/90 px-4 py-2.5 backdrop-blur-md sm:top-16 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                aria-pressed={activeCat === cat}
                className={`pill-link shrink-0 px-4 py-2 text-sm font-semibold ${
                  activeCat === cat ? "is-active" : "text-sage hover:text-ink"
                }`}
              >
                {catLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="candy-card mt-10 flex flex-col items-center gap-4 px-6 py-14 text-center" role="alert">
            <PackageX className="h-10 w-10 text-sage" aria-hidden />
            <div>
              <p className="font-display text-2xl">{t("home.error-title")}</p>
              <p className="mt-2 max-w-md text-sm text-sage">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="pop-btn h-11 px-6 text-sm font-bold"
            >
              {t("home.try-again")}
            </button>
          </div>
        ) : loading ? (
          <div className="mt-8">
            <ProductGridSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border-[1.5px] border-dashed border-ink/20 px-6 py-14 text-center">
            <p className="font-display text-2xl">{t("home.empty-title")}</p>
            <p className="mt-2 text-sm text-sage">
              {t("home.empty-sub")}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filtered.map((p, i) => (
              <div key={p.id} data-reveal="up" data-delay={`${(i % 4) * 0.05}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ PROMISE — pine field, the statement ═══ */}
      <section
        id="promise"
        className="mt-16 scroll-mt-24 bg-pine px-4 py-16 text-cream sm:mt-24 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="font-data text-xs font-bold tracking-[0.18em] text-pop uppercase">
              {t("promise.kicker")}
            </p>
            <div
              className="mt-5 text-[clamp(1.4rem,3.2vw,2.2rem)] font-medium leading-[1.3] tracking-[-0.01em]"
              data-reveal="up"
            >
              {t("promise.statement")}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-display text-4xl text-pop sm:text-5xl">
                  {locale === "mr" ? "2 तास" : "2 hrs"}
                </p>
                <p className="font-data mt-2 text-[11px] uppercase tracking-[0.12em] text-cream/70">
                  {t("promise.stat-1")}
                </p>
              </div>
              <div>
                <p className="font-display text-4xl text-pop sm:text-5xl">7–10</p>
                <p className="font-data mt-2 text-[11px] uppercase tracking-[0.12em] text-cream/70">
                  {t("promise.stat-2")}
                </p>
              </div>
              <div>
                <p className="font-display text-4xl text-pop sm:text-5xl">COD</p>
                <p className="font-data mt-2 text-[11px] uppercase tracking-[0.12em] text-cream/70">
                  {t("promise.stat-3")}
                </p>
              </div>
            </div>

            {theme?.coupon && fest && (
              <p className="sticker sticker--pop mt-12 inline-flex text-xs">
                {fest.couponText} · {t("coupon.code-word")} {theme.coupon.code}
              </p>
            )}
          </div>

          {/* Photo with parallax inside its rounded frame */}
          <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-cream/15 lg:col-span-5">
            <div className="overflow-hidden">
              <img
                src="/products/hero-sunlit.jpg"
                alt={t("promise.img-alt")}
                loading="lazy"
                decoding="async"
                data-parallax="0.12"
                className="aspect-[4/5] w-full scale-[1.25] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewed products={products} />
      <ScrollToTop />
    </div>
  );
}

/** Deal section add button. */
function DealAddButton({ product }: { product: ProductListItem }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const out = product.stock <= 0;
  const { t } = useI18n();
  const name = useMrName(product.name);

  async function add() {
    if (status === "loading" || out) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setStatus("added");
        window.dispatchEvent(new Event("sss:cart-changed"));
        setTimeout(() => setStatus("idle"), 1400);
      } else setStatus("idle");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={out}
      className={`pop-btn inline-flex h-12 items-center gap-2 bg-ink px-7 text-sm font-bold ${
        out ? "cursor-not-allowed bg-cream text-sage hover:translate-y-0" : ""
      } ${status === "added" ? "bg-pine hover:bg-pine" : ""}`}
      aria-label={t("card.add-aria", { name })}
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : status === "added" ? (
        <>
          <AnimatedIcon name="check-white" size={15} trigger="once" />{" "}
          {t("deal.added")}
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden /> {t("deal.add")}
        </>
      )}
    </button>
  );
}

/** Compact add for index rows. */
function MiniAdd({ product }: { product: ProductListItem }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const out = product.stock <= 0;
  const { t } = useI18n();
  const name = useMrName(product.name);

  async function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading" || out) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setStatus("added");
        window.dispatchEvent(new Event("sss:cart-changed"));
        setTimeout(() => setStatus("idle"), 1400);
      } else setStatus("idle");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={out}
      aria-label={t("card.add-aria", { name })}
      className={`pop-btn inline-flex h-11 w-11 shrink-0 items-center justify-center ${
        out ? "cursor-not-allowed bg-cream text-sage hover:translate-y-0" : ""
      } ${status === "added" ? "bg-pine hover:bg-pine" : ""}`}
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : status === "added" ? (
        <AnimatedIcon name="check-white" size={15} trigger="once" />
      ) : (
        <Plus className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
