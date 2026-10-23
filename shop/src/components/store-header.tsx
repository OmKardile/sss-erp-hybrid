"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Search, Store } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

/**
 * Single-row sticky header.
 * Mobile: logo + full-width search + cart (ONE search bar on the page —
 * the hero no longer duplicates it).
 * Desktop: logo + search + cart, max-w-7xl.
 * Solid deep emerald — no gradient decoration.
 */
export function StoreHeader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setCount(data?.itemCount ?? data?.items?.length ?? 0);
      } catch {}
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("sss:cart-changed", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("sss:cart-changed", refresh);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/20 bg-emerald-800 text-white shadow-sm safe-area-pt">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center gap-2"
          aria-label={`${STORE_CONFIG.name} — home`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Store className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-semibold">
              {STORE_CONFIG.name}
            </span>
            <span className="block text-[10px] text-emerald-100/90">
              Pune · Online orders
            </span>
          </span>
        </Link>

        {/* Search — the single search on mobile */}
        <form action="/" method="GET" className="flex min-w-0 flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue=""
              placeholder="Search atta, milk, soap…"
              aria-label="Search products"
              className="h-11 w-full rounded-xl border border-transparent bg-white pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-300"
            />
          </div>
        </form>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"
          aria-label={`Cart${count > 0 ? ` — ${count} items` : ""}`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-900 ring-2 ring-emerald-800">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
