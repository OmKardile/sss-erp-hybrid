"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Search, Store, Zap } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export function StoreHeader() {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(0);
  const prevCount = useRef(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          const next = data?.itemCount ?? data?.items?.length ?? 0;
          setCount(next);
          if (next > prevCount.current) setBump((b) => b + 1);
          prevCount.current = next;
        }
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
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-md safe-area-pt">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 safe-area-px sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner backdrop-blur">
            <Store className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80 animate-ping-slow" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
            </span>
          </div>
          <div className="hidden xs:block sm:block leading-tight">
            <p className="text-xs font-bold text-white sm:text-sm">
              {STORE_CONFIG.name}
            </p>
            <p className="hidden text-[10px] text-emerald-50/90 sm:block">
              Pune • Online Order
            </p>
          </div>
        </Link>

        {/* 10-min delivery badge */}
        <div className="hidden items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-bold text-amber-950 shadow-sm md:flex">
          <Zap className="h-3 w-3 fill-amber-950" />
          10 min
        </div>

        {/* Search bar (desktop) */}
        <form action="/" method="GET" className="flex-1 hidden md:flex items-center">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              name="q"
              defaultValue=""
              placeholder="Search for products, brands…"
              className="h-10 w-full rounded-full border border-white/20 bg-white/95 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-300/30"
            />
          </div>
        </form>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Cart */}
        <Link
          href="/cart"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 sm:w-auto sm:gap-2 sm:px-4"
          aria-label="Cart"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="ml-2 hidden text-sm font-semibold sm:inline">
            Cart
          </span>
          {count > 0 && (
            <span
              key={bump}
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-950 shadow-md ring-2 ring-emerald-600 animate-badge-pop"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile search row (always visible on mobile) */}
      <div className="bg-emerald-700/40 px-3 py-2 md:hidden safe-area-px">
        <form action="/" method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
          <input
            type="text"
            name="q"
            defaultValue=""
            placeholder="Search products…"
            className="h-9 w-full rounded-full border border-white/10 bg-white/95 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-amber-300"
          />
        </form>
      </div>
    </header>
  );
}
