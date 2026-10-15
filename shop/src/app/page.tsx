"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Sparkles,
  Truck,
  ShieldCheck,
  Search,
  Loader2,
  Store,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { DEFAULT_CATEGORIES, STORE_CONFIG } from "@/lib/config";
import type { ProductListItem } from "@/lib/types";

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
          setCategories(
            ["All", ...data.categories.filter(Boolean)] as string[],
          );
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
              setCategories(
                ["All", ...data.categories.filter(Boolean)] as string[],
              );
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
    () => products.filter((p) => p.isFeatured).slice(0, 8),
    [products],
  );

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-teal-200 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Now delivering across Pune
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Fresh groceries delivered to your doorstep
              </h1>
              <p className="mt-3 max-w-md text-emerald-50 sm:text-base">
                Shop from {STORE_CONFIG.name} — your trusted local grocery
                store. Quality products, fair prices, fast delivery.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#shop"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                >
                  Start Shopping
                </a>
                <a
                  href="#featured"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  View Featured
                </a>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery ₹500+</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Quality assured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span>COD &amp; UPI</span>
                </div>
              </div>
            </div>

            {/* Search panel */}
            <div className="animate-fade-in-up rounded-2xl bg-white/95 p-5 text-slate-900 shadow-xl backdrop-blur sm:p-6">
              <label className="text-xs font-medium text-slate-500">
                Search products
              </label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try ‘milk’, ‘atta’, ‘biscuits’…"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {filtered.length} product{filtered.length === 1 ? "" : "s"}{" "}
                found
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Milk", "Atta", "Biscuits", "Oil", "Onion"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8 scroll-soft">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition " +
                (activeCat === c
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section id="featured" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Featured Products
              </h2>
              <p className="text-sm text-slate-500">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* All products */}
      <section
        id="shop"
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {activeCat === "All" ? "All Products" : activeCat}
            </h2>
            <p className="text-sm text-slate-500">
              {filtered.length} item{filtered.length === 1 ? "" : "s"}
              {query && ` matching "${query}"`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
            <p className="text-sm">Loading fresh products…</p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-rose-600">
            <Package className="h-10 w-10" />
            <p className="text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
            <Package className="h-10 w-10" />
            <p className="text-sm">No products found.</p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCat("All");
              }}
              className="mt-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Info strip */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Truck className="h-6 w-6 text-emerald-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Fast delivery in Pune
            </p>
            <p className="text-xs text-slate-500">
              Get your order in as little as 2 hours. Free delivery on orders
              above ₹500.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Quality you can trust
            </p>
            <p className="text-xs text-slate-500">
              Every product is hand-checked for freshness before it leaves our
              store.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <Store className="h-6 w-6 text-emerald-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Local Pune store
            </p>
            <p className="text-xs text-slate-500">
              Serving our community since years. COD &amp; UPI payments
              accepted.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
