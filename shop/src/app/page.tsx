"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Truck,
  ChevronRight,
  PackageSearch,
  Clock,
  BadgeCheck,
  Star,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { DealOfDay } from "@/components/deal-of-day";
import { RecentlyViewed } from "@/components/recently-viewed";
import { Reveal, EASE_OUT } from "@/components/reveal";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";
import { ScrollToTop } from "@/components/scroll-to-top";
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
      {/* HERO — compact mobile composition: photo + legibility scrim,
          display headline, one trust line. Search lives in the header.
          During a festival window the hero swaps to the festive photo +
          festive copy (Blinkit/Zepto-style seasonal merchandising). */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <img
          src={theme?.heroImage || "/products/hero.jpg"}
          alt={
            theme
              ? `${theme.festival} festive essentials at ${STORE_CONFIG.name}`
              : "Fresh produce shelves at Shubham Super Shopee"
          }
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Functional scrim for text legibility over a real photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-stone-950/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          {/* Staggered entrance — kicker → headline → subline (mount, not
              whileInView: the hero is already in view). */}
          <motion.p
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {theme ? theme.kicker : `${STORE_CONFIG.name} · Pune`}
          </motion.p>
          <motion.h1
            className="font-display mt-2 max-w-md text-[2rem] font-semibold leading-[1.1] sm:text-4xl lg:text-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT }}
          >
            {theme ? (
              theme.headline.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))
            ) : (
              <>
                Fresh groceries,
                <br />
                delivered fast.
              </>
            )}
          </motion.h1>
          <motion.p
            className="mt-2 max-w-sm text-sm text-stone-200 sm:text-base"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16, ease: EASE_OUT }}
          >
            {theme
              ? theme.subline
              : "Your trusted local store — quality products, fair prices, COD & UPI accepted."}
          </motion.p>

          {/* Trust chips — frosted glass over the hero photo */}
          <motion.div
            className="mt-5 flex flex-wrap gap-2"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
          >
            <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white">
              <Truck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              2-hour delivery
            </span>
            <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden />
              4.8 · loved locally
            </span>
            <span className="glass-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              COD &amp; UPI
            </span>
          </motion.div>
        </div>
      </section>

      {/* CATEGORY PHOTO RAIL — horizontal scroll, thumb-friendly.
          Mobile-first: a rail, not a squeezed desktop grid. */}
      <section
        id="categories"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-6 sm:px-6 lg:px-8"
      >
        <Reveal>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
              Shop by category
            </h2>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
            {TILE_CATEGORIES.map((cat) => {
              const img = CATEGORY_IMAGE[cat] ?? "/products/cat-groceries.jpg";
              return (
                <Link
                  key={cat}
                  href={`/?category=${encodeURIComponent(cat)}`}
                  onClick={() => setActiveCat(cat)}
                  className="group flex w-[84px] shrink-0 flex-col items-center gap-2 sm:w-24"
                >
                  <span className="block h-[84px] w-[84px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-md group-hover:shadow-stone-900/10 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:h-24 sm:w-24">
                    <img
                      src={img}
                      alt={cat}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </span>
                  <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-stone-700 transition-colors group-hover:text-emerald-800">
                    {cat}
                  </span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* DEAL OF THE DAY — wide scannable card, rotates daily IST */}
      <Reveal className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <DealOfDay deal={deal} />
      </Reveal>

      {/* PROMO — frosted glass over a deep emerald gradient; carries the
          festival coupon during a festive window. */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 px-5 py-5 text-white shadow-[0_16px_44px_rgba(6,78,59,0.28)] transition-shadow duration-300 hover:shadow-[0_20px_54px_rgba(6,78,59,0.36)] motion-reduce:transition-none sm:px-6">
            {/* Glass orbs — light refracting through the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                {theme?.coupon ? (
                  <p className="inline-flex flex-wrap items-center gap-2 font-display text-base font-semibold sm:text-lg">
                    {theme.festival} offer
                    <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-xs font-bold tracking-wider backdrop-blur">
                      {theme.coupon.code}
                    </span>
                  </p>
                ) : (
                  <p className="font-display text-base font-semibold sm:text-lg">
                    Free delivery above ₹{FREE_DELIVERY_THRESHOLD}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-emerald-100">
                  {theme?.coupon
                    ? `${theme.coupon.text} · applies at checkout`
                    : "Stock up your kitchen — we bring it to your door."}
                </p>
              </div>
              <a
                href="#shop"
                className="group inline-flex h-10 items-center gap-1 rounded-full bg-white px-5 text-xs font-bold text-emerald-900 shadow-md transition-shadow hover:shadow-lg"
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

      {/* FEATURED — horizontal rail; festive title during a window */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
                  {theme ? theme.sectionTitle : "Featured picks"}
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  {theme ? theme.sectionSub : "Best-sellers from our shelves"}
                </p>
              </div>
              <Link
                href="#shop"
                className="inline-flex h-10 items-center text-sm font-semibold text-emerald-700"
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

      {/* STICKY CATEGORY CHIPS — frosted glass bar, sticks below the header */}
      <section className="sticky top-14 z-30 mt-8 border-y border-white/50 bg-white/55 shadow-[0_2px_18px_rgba(28,25,23,0.07)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/45 sm:top-16">
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
                  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-xs font-semibold transition-colors " +
                  (isActive
                    ? "bg-emerald-800 text-white shadow-md shadow-emerald-900/25"
                    : "glass text-stone-700 hover:bg-white/80")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section
        id="shop"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-12 pt-6 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
              {activeCat === "All" ? "All products" : activeCat}
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
      </section>

      {/* STORE PROMISE — premium photo with a frosted glass card. */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <img
          src="/products/promise.jpg"
          alt="Fresh vegetables and greens spilling from a basket"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Reveal>
            <div className="glass-dark max-w-xl rounded-3xl p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                Hand-checked freshness, from our shelves to your door.
              </h2>
              <ul className="mt-5 space-y-2.5 text-sm text-stone-100">
                <li className="flex items-center gap-2.5">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                  Every item checked before it leaves the store
                </li>
                <li className="flex items-center gap-2.5">
                  <Truck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                  Delivery across Pune in as little as 2 hours
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <PackageSearch className="h-7 w-7 text-stone-400" aria-hidden />
      </div>
      <h3 className="font-display mt-4 text-lg font-semibold text-stone-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-stone-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
