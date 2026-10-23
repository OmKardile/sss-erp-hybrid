"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Loader2,
  ChevronRight,
  PackageSearch,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import {
  DEFAULT_CATEGORIES,
  STORE_CONFIG,
  CATEGORY_IMAGE,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/config";
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
        if (!res.ok) throw new Error("Failed to load");
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

  // Auto-seed if no products found (idempotent on the server)
  useEffect(() => {
    if (!loading && products.length === 0 && !seeded) {
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

  return (
    <div className="w-full">
      {/* HERO — compact mobile composition: photo + legibility scrim,
          display headline, one trust line. Search lives in the header. */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <img
          src="/products/hero.jpg"
          alt="Fresh produce shelves at Shubham Super Shopee"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Functional scrim for text legibility over a real photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-stone-950/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {STORE_CONFIG.name} · Pune
          </p>
          <h1 className="font-display mt-2 max-w-md text-[2rem] font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
            Fresh groceries,
            <br />
            delivered fast.
          </h1>
          <p className="mt-2 max-w-sm text-sm text-stone-200 sm:text-base">
            Your trusted local store — quality products, fair prices, COD &amp;
            UPI accepted.
          </p>
        </div>
      </section>

      {/* CATEGORY PHOTO RAIL — horizontal scroll, thumb-friendly.
          Mobile-first: a rail, not a squeezed desktop grid. */}
      <section
        id="categories"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-6 sm:px-6 lg:px-8"
      >
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
                <span className="block h-[84px] w-[84px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-24 sm:w-24">
                  <img
                    src={img}
                    alt={cat}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-stone-700">
                  {cat}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMO — flat block, single accent, no gradient */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-800 px-5 py-4 text-white">
          <div>
            <p className="font-display text-base font-semibold sm:text-lg">
              Free delivery above ₹{FREE_DELIVERY_THRESHOLD}
            </p>
            <p className="mt-0.5 text-xs text-emerald-100">
              Stock up your kitchen — we bring it to your door.
            </p>
          </div>
          <a
            href="#shop"
            className="inline-flex h-10 items-center gap-1 rounded-xl bg-white px-4 text-xs font-bold text-emerald-900"
          >
            Order now <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </section>

      {/* FEATURED — horizontal rail */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
                Featured picks
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Best-sellers from our shelves
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
        </section>
      )}

      {/* STICKY CATEGORY CHIPS — mini-nav, sticks below the single-row header */}
      <section className="sticky top-14 z-30 mt-8 border-y border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:top-16">
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
                  "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-xl px-4 text-xs font-semibold " +
                  (isActive
                    ? "bg-emerald-800 text-white"
                    : "bg-stone-100 text-stone-700")
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
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" aria-hidden />
            <p className="text-sm">Loading fresh products…</p>
          </div>
        ) : error ? (
          <EmptyState
            title="Something went wrong"
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

      {/* STORE PROMISE — one full-bleed photo, one takeaway.
          Replaces the old 3-up icon+heading+paragraph cards. */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <img
          src="/products/cat-fruits-vegetables.jpg"
          alt="Fresh fruits and vegetables at the store"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h2 className="font-display max-w-lg text-2xl font-semibold leading-tight sm:text-3xl">
            Hand-checked freshness, from our shelves to your door.
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm text-stone-200">
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
      </section>
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
