"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Search, Store, Menu, X } from "lucide-react";
import { STORE_CONFIG } from "@/lib/config";

export function StoreHeader() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch cart count on mount and when window regains focus.
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setCount(data?.itemCount ?? data?.items?.length ?? 0);
        }
      } catch {
        /* ignore */
      }
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Store className="h-5 w-5" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold text-slate-900">
              {STORE_CONFIG.name}
            </p>
            <p className="text-[10px] text-slate-500">Pune • Online Order</p>
          </div>
        </Link>

        {/* Search bar */}
        <form
          action="/"
          method="GET"
          className="flex-1 hidden md:flex items-center"
          onSubmit={(e) => e.currentTarget.requestSubmit()}
        >
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue=""
              placeholder="Search for products, brands…"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </form>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile search row */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <form action="/" method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue=""
              placeholder="Search products…"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-emerald-400"
            />
          </form>
        </div>
      )}
    </header>
  );
}
