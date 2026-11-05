"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBasket } from "lucide-react";
import { CartBadge } from "@/components/cart-badge";
import { BrandLogoLockupLight, BrandLogoMark } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { STORE_CONFIG } from "@/lib/config";

/**
 * Storefront header — the cart bar. Cream glass, pill search, lime pill
 * nav, coral basket chip (DESIGN.md, v0.11 Fresh Cart).
 */
const NAV = [
  { href: "/#shop", label: "Shop" },
  { href: "/#deal", label: "Deal" },
  { href: "/#promise", label: "Why us" },
];

export function StoreHeader() {
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

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
        "sticky top-0 z-40 w-full bg-cream/90 text-ink backdrop-blur-md safe-area-pt transition-shadow duration-300",
        scrolled ? "shadow-[0_10px_30px_rgb(14_27_18/0.08)]" : "",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Brand — hard-coded inline logo (v0.10.3) */}
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center"
          aria-label={`${STORE_CONFIG.name} — home`}
        >
          <BrandLogoMark className="h-9 w-9 sm:hidden" />
          <BrandLogoLockupLight className="hidden h-10 w-auto sm:block" />
        </Link>

        {/* Search */}
        <form action="/" method="GET" className="flex min-w-0 flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              defaultValue=""
              placeholder="Search atta, milk, soap…"
              aria-label="Search products"
              className="h-10 w-full rounded-full border-[1.5px] border-ink/10 bg-white pl-10 pr-4 text-sm text-ink shadow-[0_4px_16px_rgb(14_27_18/0.05)] placeholder:text-sage transition-[border-color,box-shadow] focus:border-pop focus:outline-none focus:ring-4 focus:ring-pop/40 sm:h-11"
            />
          </div>
        </form>

        {/* Nav — lime pill fill (desktop) */}
        <nav aria-label="Store" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="pill-link px-3.5 py-2 text-sm font-semibold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Basket — coral chip */}
        <Link
          href="/cart"
          className="pop-btn relative ml-1 flex h-11 shrink-0 items-center gap-2 px-4 md:ml-2"
          aria-label={`Basket${count > 0 ? ` — ${count} items` : ""}`}
        >
          <ShoppingBasket className="h-4.5 w-4.5" aria-hidden />
          <span className="hidden text-sm font-bold sm:inline">Basket</span>
          {count > 0 && (
            <CartBadge
              count={count}
              className="bg-mango text-ink ring-2 ring-white"
            />
          )}
        </Link>
      </div>
    </header>
  );
}
