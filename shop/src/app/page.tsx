"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Truck,
  ChevronRight,
  PackageSearch,
  Clock,
  BadgeCheck,
  Star,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { DealOfDay } from "@/components/deal-of-day";
import { RecentlyViewed } from "@/components/recently-viewed";
import { Reveal, EASE_OUT } from "@/components/reveal";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Marquee } from "@/components/marquee";
import { Parallax } from "@/components/parallax";
import { GiantWord } from "@/components/giant-word";
import { FloatingProduce } from "@/components/floating-produce";
import {
  DEFAULT_CATEGORIES,
  STORE_CONFIG,
  CATEGORY_IMAGE,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/config";
import { istDateStr } from "@/lib/festive";
import { useActiveTheme } from "@/lib/use-active-theme";
import { pickDailyDeal } from "@/lib/deal";
import improvementState from "@/config/improvement-state.json";
import type { ProductListItem } from "@/lib/types";

// Categories that get a photo tile (excludes "All")
const TILE_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c !== "All");

// Vivid per-category tile ring accents (cycled)
const TILE_ACCENTS = [
  "hover:ring-emerald-400",
  "hover:ring-amber-400",
  "hover:ring-rose-400",
  "hover:ring-sky-400",
  "hover:ring-lime-500",
  "hover:ring-orange-400",
  "hover:ring-teal-400",
  "hover:ring-violet-400",
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);
  // Festive theme is date-derived and client-only (hydration-safe snapshot).
  const theme = useActiveTheme();
  const reduceMotion = useReducedMotion();

  // Hero parallax — the whole hero layer drifts up slower than scroll
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroPhotoY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroPhotoRot = useTransform(heroProgress, [0, 1], [2.5, -1.5]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 34]);

  // Promise-section background parallax (depth behind the card)
  const promiseRef = useRef<HTMLElement>(null);
  const { scrollYProgress: promiseProgress } = useScroll({
    target: promiseRef,
    offset: ["start end", "end start"],
  });
  const promiseBgY = useTransform(promiseProgress, [0, 1], ["-12%", "12%"]);

  // Read query params on mount (search bar submits ?q=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("category");
    if (q) setQuery(q);
    if (cat) setActiveCat(cat);
  }, []);

  // Load all products once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) {
          // Surface actionable deployment errors (DB not configured etc.)
          let msg = "Failed to load products";
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
        setError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-seed only when the DB works but the store is genuinely empty
  // (never when products failed to load — that just piles on 500s).
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
          (p.brand || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, activeCat, query]);

  const featured = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 10),
    [products],
  );

  // Deal of the Day — improver-pinned pick first, then the deterministic
  // daily rotation over discounted, in-stock products.
  const deal = useMemo(() => {
    const pinned = (improvementState as any)?.deal?.slug as string | undefined;
    if (pinned) {
      const p = products.find(
        (x) => x.slug === pinned && x.stock > 0,
      );
      if (p) return p;
    }
    return pickDailyDeal(products, istDateStr());
  }, [products]);

  return (
    <div className="w-full">
      {/* ═══════════ HERO — Sunlit Pop Market ═══════════
          Bright ivory canvas + saturated gradient type at huge scale,
          floating produce at multiple parallax depths, tilted photo
          card. Festival windows swap photo + copy, same composition. */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-transparent"
      >
        {/* Local gradient washes behind the type */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-300/40 blur-[90px]" />
          <div className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-amber-300/45 blur-[90px]" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-300/35 blur-[90px]" />
        </div>

        {/* Floating produce — parallax depth layer ("images everywhere") */}
        <FloatingProduce />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            {/* ── Type stack ── */}
            <motion.div style={reduceMotion ? undefined : { y: heroContentY }}>
              <motion.p
                className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                {theme ? theme.kicker : `Pune · ${STORE_CONFIG.name}`}
              </motion.p>

              <motion.h1
                className="font-display mt-4 text-[clamp(2.9rem,9vw,6.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-stone-900"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT }}
              >
                {theme ? (
                  theme.headline.split("\n").map((line, i) => (
                    <span
                      key={i}
                      className={
                        i === 0
                          ? "text-gradient-fresh block"
                          : "text-gradient-sun block"
                      }
                    >
                      {line}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="text-gradient-fresh block">Fresh.</span>
                    <span className="text-gradient-sun block">Fast.</span>
                    <span className="block">
                      To your{" "}
                      <span className="font-serif-accent normal-case tracking-normal">
                        door.
                      </span>
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                className="mt-5 max-w-md text-[15px] leading-relaxed text-stone-600 sm:text-base"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16, ease: EASE_OUT }}
              >
                {theme
                  ? theme.subline
                  : "Your trusted local store — hand-checked quality, fair prices, COD & UPI. Delivered across Pune in as little as 2 hours."}
              </motion.p>

              {/* CTAs — vivid pill + glass ghost */}
              <motion.div
                className="mt-7 flex flex-wrap items-center gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
              >
                <a
                  href="#shop"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-emerald-700 px-7 text-sm font-bold text-white shadow-[0_10px_30px_rgba(4,120,87,0.45)] transition-[background-color,box-shadow,transform] hover:bg-emerald-600 hover:shadow-[0_14px_36px_rgba(4,120,87,0.55)] active:scale-[0.98] motion-reduce:active:scale-100"
                >
                  Shop now
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>
                <a
                  href="#categories"
                  className="glass inline-flex h-12 items-center rounded-full px-6 text-sm font-bold text-stone-800 transition-colors hover:bg-white/85"
                >
                  Browse the market
                </a>
              </motion.div>

              {/* Trust chips — white glass with vivid icons */}
              <motion.div
                className="mt-7 flex flex-wrap gap-2.5"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.32, ease: EASE_OUT }}
              >
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-stone-800">
                  <Truck className="h-4 w-4 text-emerald-600" aria-hidden />
                  2-hour delivery
                </span>
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-stone-800">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  4.8 · loved locally
                </span>
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-stone-800">
                  <BadgeCheck className="h-4 w-4 text-rose-500" aria-hidden />
                  COD &amp; UPI
                </span>
              </motion.div>
            </motion.div>

            {/* ── Tilted photo card with parallax ── */}
            <motion.div
              className="relative mx-auto w-full max-w-md lg:max-w-none"
              style={
                reduceMotion
                  ? undefined
                  : { y: heroPhotoY, rotate: heroPhotoRot }
              }
            >
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
                className="relative"
              >
                {/* Color halo behind the card */}
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-emerald-400/40 via-amber-300/40 to-rose-400/40 blur-2xl"
                />
                <div className="relative overflow-hidden rounded-[1.8rem] border-4 border-white shadow-[0_24px_70px_rgba(120,90,40,0.3)]">
                  <img
                    src={theme?.heroImage || "/products/hero-sunlit.jpg"}
                    alt={
                      theme
                        ? `${theme.festival} festive essentials at ${STORE_CONFIG.name}`
                        : "A bright flat-lay of fresh groceries at Shubham Super Shopee"
                    }
                    className="aspect-[7/5] w-full object-cover sm:aspect-[4/3]"
                  />
                  {/* Soft bottom scrim + glass caption chip */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/45 to-transparent" />
                  <div className="glass-dark absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-white">
                    <Clock className="h-3.5 w-3.5 text-lime-300" aria-hidden />
                    {theme ? theme.badgeLabel : "Delivered in 2 hours"}
                  </div>
                </div>

                {/* Floating price sticker — the fun pop */}
                <motion.div
                  aria-hidden
                  className="absolute -right-3 -top-4 sm:-right-5"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.5, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 6 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT }}
                >
                  <div className="float-idle rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-4 py-2.5 shadow-[0_14px_36px_rgba(249,115,22,0.5)]" style={{ "--float-duration": "5.5s" } as React.CSSProperties}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-950/80">
                      From
                    </p>
                    <p className="font-display text-xl font-extrabold leading-none text-white">
                      ₹33
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ MARQUEE — vivid gradient ticker ═══════════ */}
      <Marquee
        variant="band"
        items={[
          "Farm-fresh produce",
          "2-hour delivery",
          "COD & UPI",
          "Hand-checked quality",
          "Open 7 AM – 10 PM",
          "Pune's own store",
        ]}
      />

      {/* ═══════════ CATEGORY PHOTO RAIL ═══════════
          Drifting giant word behind, vivid hover rings. */}
      <section
        id="categories"
        className="relative scroll-mt-28 pt-10 sm:pt-14"
      >
        <GiantWord word="MARKET" className="top-0 opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-stone-900 sm:text-3xl">
                Browse the{" "}
                <span className="font-serif-accent normal-case text-emerald-700">
                  market
                </span>
              </h2>
              <p className="hidden text-xs font-semibold uppercase tracking-widest text-stone-400 sm:block">
                {TILE_CATEGORIES.length} aisles
              </p>
            </div>
            <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-3 no-scrollbar sm:mx-0 sm:px-0">
              {TILE_CATEGORIES.map((cat, i) => {
                const img = CATEGORY_IMAGE[cat] ?? "/products/cat-groceries.jpg";
                const accent = TILE_ACCENTS[i % TILE_ACCENTS.length];
                return (
                  <Link
                    key={cat}
                    href={`/?category=${encodeURIComponent(cat)}`}
                    onClick={() => setActiveCat(cat)}
                    className="group flex w-[92px] shrink-0 flex-col items-center gap-2.5 sm:w-28"
                  >
                    <span
                      className={`block h-[92px] w-[92px] overflow-hidden rounded-[1.4rem] border-4 border-white bg-stone-100 shadow-[0_10px_28px_rgba(120,90,40,0.18)] ring-2 ring-transparent transition-[transform,box-shadow,--tw-ring-color] duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_16px_36px_rgba(120,90,40,0.28)] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:h-28 sm:w-28 ${accent} group-hover:ring-4`}
                    >
                      <img
                        src={img}
                        alt={cat}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </span>
                    <span className="line-clamp-2 text-center text-[11px] font-bold leading-tight text-stone-600 transition-colors group-hover:text-emerald-700">
                      {cat}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ DEAL OF THE DAY — wrapped in parallax ═══════════ */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Parallax from={24} to={-10}>
          <Reveal>
            <DealOfDay deal={deal} />
          </Reveal>
        </Parallax>
      </div>

      {/* ═══════════ PROMO — vivid emerald→teal→lime gradient ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-lime-600 px-5 py-5 text-white shadow-[0_18px_50px_rgba(4,120,87,0.4)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(4,120,87,0.5)] motion-reduce:transition-none sm:px-6">
            {/* Glass orbs — light refracting through the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-lime-300/30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                {theme?.coupon ? (
                  <p className="inline-flex flex-wrap items-center gap-2 font-display text-base font-bold sm:text-lg">
                    {theme.festival} offer
                    <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2.5 py-0.5 text-xs font-extrabold tracking-wider backdrop-blur">
                      {theme.coupon.code}
                    </span>
                  </p>
                ) : (
                  <p className="font-display text-base font-bold sm:text-lg">
                    Free delivery above ₹{FREE_DELIVERY_THRESHOLD}
                  </p>
                )}
                <p className="mt-0.5 text-xs font-medium text-emerald-50">
                  {theme?.coupon
                    ? `${theme.coupon.text} · applies at checkout`
                    : "Stock up your kitchen — we bring it to your door."}
                </p>
              </div>
              <a
                href="#shop"
                className="group inline-flex h-10 items-center gap-1 rounded-full bg-white px-5 text-xs font-extrabold text-emerald-800 shadow-md transition-shadow hover:shadow-lg"
              >
                Order now{" "}
                <ChevronRight
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════ FEATURED RAIL ═══════════ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-stone-900 sm:text-3xl">
                  {theme ? (
                    theme.sectionTitle
                  ) : (
                    <>
                      Featured{" "}
                      <span className="font-serif-accent normal-case text-amber-600">
                        picks
                      </span>
                    </>
                  )}
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  {theme ? theme.sectionSub : "Best-sellers from our shelves"}
                </p>
              </div>
              <Link
                href="#shop"
                className="inline-flex h-10 items-center text-sm font-bold text-emerald-700"
              >
                View all
              </Link>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
              {featured.map((p) => (
                <div key={p.id} className="w-40 shrink-0 sm:w-48">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* RECENTLY VIEWED — resurfaces browsing history (no account needed) */}
      <RecentlyViewed products={products} />

      {/* ═══════════ STICKY CATEGORY CHIPS — frosted glass bar ═══════════ */}
      <section className="sticky top-14 z-30 mt-10 border-y border-white/60 bg-white/60 shadow-[0_2px_18px_rgba(120,90,40,0.1)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 sm:top-16">
        <div
          className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar sm:px-6 lg:px-8"
          role="tablist"
          aria-label="Filter products by category"
        >
          {categories.map((c) => {
            const isActive = activeCat === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCat(c)}
                className={
                  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-xs font-bold transition-colors " +
                  (isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/30"
                    : "glass text-stone-700 hover:bg-white/85")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════ PRODUCT GRID — giant word drifting behind ═══════════ */}
      <section
        id="shop"
        className="relative scroll-mt-28 pb-14 pt-8"
      >
        <GiantWord word="FRESH" className="top-2 opacity-60" drift={-60} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-stone-900 sm:text-3xl">
                {activeCat === "All" ? (
                  <>
                    All{" "}
                    <span className="font-serif-accent normal-case text-emerald-700">
                      products
                    </span>
                  </>
                ) : (
                  activeCat
                )}
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                {filtered.length} item{filtered.length === 1 ? "" : "s"}
                {query && ` matching “${query}”`}
              </p>
            </div>
          </div>

          {loading ? (
            <>
              <p className="sr-only">Loading fresh products…</p>
              <ProductGridSkeleton count={8} />
            </>
          ) : error ? (
            <EmptyState
              title="Couldn’t load the store"
              message={error}
              actionLabel="Try again"
              onAction={() => window.location.reload()}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try a different search or category."
              actionLabel="Clear filters"
              onAction={() => {
                setQuery("");
                setActiveCat("All");
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ STORE PROMISE — parallax photo with warm wash ═══════════ */}
      <section
        ref={promiseRef}
        className="relative overflow-hidden bg-stone-950 text-white"
      >
        {/* Parallax background — the photo travels slower than scroll */}
        <motion.div
          aria-hidden
          className="absolute -inset-y-[14%] inset-x-0"
          style={reduceMotion ? undefined : { y: promiseBgY }}
        >
          <img
            src="/products/market-sunlit.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </motion.div>
        {/* Warm gradient wash — sunset-market mood, keeps text legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/75 via-rose-950/45 to-emerald-950/60" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <div className="glass-dark max-w-xl rounded-3xl p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
                The store promise
              </p>
              <h2 className="font-display mt-2 text-2xl font-extrabold leading-tight sm:text-4xl">
                Hand-checked freshness,{" "}
                <span className="font-serif-accent font-medium text-amber-200">
                  from our shelves to your door.
                </span>
              </h2>
              <ul className="mt-6 space-y-3 text-sm font-medium text-stone-100">
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/25 ring-1 ring-emerald-300/40">
                    <BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden />
                  </span>
                  Every item checked before it leaves the store
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/25 ring-1 ring-amber-300/40">
                    <Truck className="h-4 w-4 text-amber-300" aria-hidden />
                  </span>
                  Delivery across Pune in as little as 2 hours
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-400/25 ring-1 ring-rose-300/40">
                    <Clock className="h-4 w-4 text-rose-300" aria-hidden />
                  </span>
                  Open daily, 7 AM – 10 PM
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Back-to-top for the long product grid */}
      <ScrollToTop />
    </div>
  );
}

function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
        <PackageSearch className="h-7 w-7 text-stone-400" aria-hidden />
      </div>
      <h3 className="font-display mt-4 text-lg font-bold text-stone-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-stone-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-emerald-700 px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(4,120,87,0.35)] transition-colors hover:bg-emerald-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
