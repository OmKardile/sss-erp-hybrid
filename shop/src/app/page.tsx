"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Search,
  Loader2,
  Zap,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import {
  DEFAULT_CATEGORIES,
  STORE_CONFIG,
  CATEGORY_EMOJI,
  CATEGORY_COLORS,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/config";
import type { ProductListItem } from "@/lib/types";

// Categories that get a colorful tile (excludes "All")
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
      {/* HERO — compact Blinkit-style gradient banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white">
        {/* Decorative floating emoji */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
          <span className="absolute right-6 top-6 text-6xl drop-shadow-lg animate-float-y sm:right-12 sm:top-8 sm:text-8xl">
            🛒
          </span>
          <span className="absolute right-32 bottom-4 hidden text-4xl animate-float-y sm:block" style={{ animationDelay: "0.6s" }}>
            🥕
          </span>
          <span className="absolute right-52 top-10 hidden text-3xl animate-float-y md:block" style={{ animationDelay: "1.2s" }}>
            🥛
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm">
              <Zap className="h-3.5 w-3.5 fill-amber-950" /> 10-minute delivery in Pune
            </span>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-4xl lg:text-5xl">
              Fresh groceries in{" "}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                10 minutes
              </span>{" "}
              🚀
            </h1>
            <p className="mt-2 max-w-md text-sm text-emerald-50 sm:text-base">
              {STORE_CONFIG.name} — your trusted local grocery store. Quality
              products, fair prices, lightning-fast delivery.
            </p>

            {/* Inline search */}
            <div className="mt-4 flex max-w-md items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try ‘milk’, ‘atta’, ‘biscuits’…"
                  className="h-11 w-full rounded-xl border border-white/20 bg-white/95 pl-10 pr-4 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-amber-300/40"
                />
              </div>
              <a
                href="#shop"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 px-4 text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-300 active:scale-95"
              >
                Shop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INFO PILLS */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Pill color="emerald" icon={<Zap className="h-3.5 w-3.5" />} label="2hr Delivery" />
          <Pill color="blue" icon={<CreditCard className="h-3.5 w-3.5" />} label="COD & UPI" />
          <Pill color="amber" icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Quality Assured" />
          <Pill color="rose" icon={<Truck className="h-3.5 w-3.5" />} label={`Free delivery ₹${FREE_DELIVERY_THRESHOLD}+`} />
        </div>
      </section>

      {/* STICKY CATEGORY CHIPS — sticks below the header */}
      <section className="sticky top-[108px] z-30 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:top-16">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar sm:px-6 lg:px-8">
          {categories.map((c) => {
            const isActive = activeCat === c;
            const emoji = c === "All" ? "🛒" : (CATEGORY_EMOJI[c] ?? "📦");
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition tap-scale " +
                  (isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700")
                }
              >
                <span>{emoji}</span>
                {c}
              </button>
            );
          })}
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Shop by category 🛍️
          </h2>
          <span className="text-xs text-slate-500">Tap to browse</span>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
          {TILE_CATEGORIES.map((cat) => {
            const emoji = CATEGORY_EMOJI[cat] ?? "🛒";
            const gradient = CATEGORY_COLORS[cat] ?? "from-emerald-400 to-teal-500";
            return (
              <Link
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                onClick={() => setActiveCat(cat)}
                className="group flex flex-col items-center gap-2 tap-scale"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-md transition group-hover:shadow-lg sm:h-20 sm:w-20 sm:text-4xl`}
                >
                  <span className="drop-shadow-sm transition group-hover:scale-110">
                    {emoji}
                  </span>
                </div>
                <span className="line-clamp-1 text-center text-[10px] font-medium text-slate-700 sm:text-xs">
                  {cat}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-4 text-white shadow-md animate-gradient-shift sm:px-6">
          <div className="relative flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-wiggle">🎉</span>
              <div>
                <p className="text-sm font-extrabold sm:text-base">
                  Free delivery on orders above ₹{FREE_DELIVERY_THRESHOLD}!
                </p>
                <p className="text-[11px] text-white/90 sm:text-xs">
                  Stock up your kitchen — we&apos;ll bring it to your door for free.
                </p>
              </div>
            </div>
            <a
              href="#shop"
              className="inline-flex h-9 items-center gap-1 rounded-full bg-white/95 px-4 text-xs font-bold text-orange-600 shadow-sm transition hover:bg-white active:scale-95"
            >
              Order now <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-24 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
        </div>
      </section>

      {/* FEATURED — horizontal scroll */}
      {featured.length > 0 && (
        <section id="featured" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl">
                <Sparkles className="h-5 w-5 text-amber-500" /> Featured picks
              </h2>
              <p className="text-xs text-slate-500">
                Hand-picked best-sellers from our shelves
              </p>
            </div>
            <Link
              href="#shop"
              className="hidden text-sm font-medium text-emerald-700 hover:underline sm:inline"
            >
              View all →
            </Link>
          </div>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
            {featured.map((p) => (
              <div
                key={p.id}
                className="w-40 shrink-0 sm:w-48 md:w-52"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCT GRID */}
      <section
        id="shop"
        className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {activeCat === "All" ? "All products" : activeCat}
            </h2>
            <p className="text-xs text-slate-500">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
              {query && ` matching "${query}"`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm">Loading fresh products…</p>
          </div>
        ) : error ? (
          <EmptyState
            emoji="😵"
            title="Something went wrong"
            message={error}
            actionLabel="Try again"
            onAction={() => window.location.reload()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🔍"
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

      {/* INFO STRIP */}
      <section className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <InfoCard
            emoji="🚚"
            color="from-emerald-400 to-teal-500"
            title="Fast delivery in Pune"
            text="Get your order in as little as 2 hours. Free delivery on orders above ₹500."
          />
          <InfoCard
            emoji="✅"
            color="from-amber-400 to-orange-500"
            title="Quality you can trust"
            text="Every product is hand-checked for freshness before it leaves our store."
          />
          <InfoCard
            emoji="🏪"
            color="from-rose-400 to-pink-500"
            title="Local Pune store"
            text="Serving our community since years. COD & UPI payments accepted."
          />
        </div>
      </section>
    </div>
  );
}

function Pill({
  color,
  icon,
  label,
}: {
  color: "emerald" | "blue" | "amber" | "rose";
  icon: React.ReactNode;
  label: string;
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${colorMap[color]}`}
    >
      {icon}
      {label}
    </span>
  );
}

function InfoCard({
  emoji,
  color,
  title,
  text,
}: {
  emoji: string;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-xl shadow-sm`}
      >
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
}: {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/40 px-6 py-16 text-center">
      <span className="text-6xl drop-shadow-sm">{emoji}</span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
