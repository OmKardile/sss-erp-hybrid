"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AnimatedIcon } from "@/components/animated-icon";
import { CartBadge } from "@/components/cart-badge";
import { cn } from "@/lib/utils";
import { STORE_CONFIG } from "@/lib/config";

/**
 * Single-row sticky header — bright frosted glass over the sunlit
 * color field (v0.10.0 light mood).
 * Mobile: logo + full-width search + cart (ONE search bar on the page —
 * the hero no longer duplicates it).
 * Desktop: logo + search + cart, max-w-7xl.
 */
export function StoreHeader() {
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Elevation on scroll — the header gains depth as content slides under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-[#fffdf8]/85 text-stone-900 transition-[background-color,box-shadow] duration-300 backdrop-blur-xl supports-[backdrop-filter]:bg-[#fffdf8]/70 safe-area-pt",
        scrolled
          ? "bg-[#fffdf8]/95 shadow-[0_10px_36px_rgba(120,90,40,0.16)] supports-[backdrop-filter]:bg-[#fffdf8]/88"
          : "shadow-sm shadow-emerald-900/5",
      )}
    >
      {/* Specular top edge — glass pane highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/15 to-transparent"
      />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo — brand mark on mobile, full lockup on desktop */}
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center"
          aria-label={`${STORE_CONFIG.name} — home`}
        >
          <img
            src="/logo-mark.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 drop-shadow-[0_2px_10px_rgba(6,78,59,0.25)] sm:hidden"
          />
          <img
            src="/logo.svg"
            alt=""
            width={163}
            height={44}
            className="hidden h-11 w-auto drop-shadow-[0_2px_12px_rgba(6,78,59,0.22)] sm:block"
          />
        </Link>

        {/* Search — the single search on mobile. Frosted pill. */}
        <form action="/" method="GET" className="flex min-w-0 flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue=""
              placeholder="Search atta, milk, soap…"
              aria-label="Search products"
              className="h-10 w-full rounded-full border border-emerald-900/10 bg-white pl-10 pr-4 text-sm text-stone-900 shadow-[0_2px_12px_rgba(120,90,40,0.1)] placeholder:text-stone-400 transition-[border-color,box-shadow] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/35 sm:h-11"
            />
          </div>
        </form>

        {/* Cart — vivid emerald chip (the color pop) */}
        <Link
          href="/cart"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-[0_6px_20px_rgba(4,120,87,0.4)] transition-[background-color,box-shadow] hover:bg-emerald-600 hover:shadow-[0_8px_24px_rgba(4,120,87,0.5)]"
          aria-label={`Cart${count > 0 ? ` — ${count} items` : ""}`}
        >
          <AnimatedIcon
            name="cart-light"
            size={20}
            trigger="hover"
            playOnEvent="sss:cart-changed"
          />
          {count > 0 && (
            <CartBadge
              count={count}
              className="absolute -right-1 -top-1 bg-amber-400 text-emerald-950 ring-2 ring-white"
            />
          )}
        </Link>
      </div>
    </header>
  );
}
