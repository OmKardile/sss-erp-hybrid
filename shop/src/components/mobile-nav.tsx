"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedIcon } from "@/components/animated-icon";
import { CartBadge } from "@/components/cart-badge";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom navigation — thumb-zone primary nav.
 * Visible below lg. Shows the live cart badge and the active section.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

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

  const isHome = pathname === "/";
  const isCart = pathname === "/cart";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden safe-area-pb"
    >
      {/* Floating glass pill (iOS-style dock). Geometry preserved: the
          wrapper still occupies the bottom 3.5rem + safe-area band, so
          sticky CTA bars on cart/checkout/product keep their offsets. */}
      <div className="glass-strong mx-3 mb-2 flex rounded-[1.35rem] shadow-[0_12px_36px_rgba(28,25,23,0.22)]">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isHome ? "text-emerald-700" : "text-stone-500 hover:text-stone-800",
          )}
        >
          <AnimatedIcon
            name="home"
            size={20}
            key={isHome ? "active" : "idle"}
            trigger={isHome ? "once" : "hover"}
          />
          Home
        </Link>
        <div aria-hidden className="my-2.5 w-px bg-stone-900/8" />
        <Link
          href="/#categories"
          className={cn(
            "flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            !isHome && !isCart
              ? "text-emerald-700"
              : "text-stone-500 hover:text-stone-800",
          )}
        >
          <AnimatedIcon
            name="grid"
            size={20}
            key={!isHome && !isCart ? "active" : "idle"}
            trigger={!isHome && !isCart ? "once" : "hover"}
          />
          Shop
        </Link>
        <div aria-hidden className="my-2.5 w-px bg-stone-900/8" />
        <Link
          href="/cart"
          aria-current={isCart ? "page" : undefined}
          className={cn(
            "relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
            isCart ? "text-emerald-700" : "text-stone-500 hover:text-stone-800",
          )}
        >
          <AnimatedIcon
            name="cart"
            size={20}
            key={isCart ? "active" : "idle"}
            trigger={isCart ? "once" : "hover"}
            playOnEvent="sss:cart-changed"
          />
          Cart
          {count > 0 && (
            <CartBadge
              count={count}
              aria-label={`${count} items in cart`}
              className="absolute right-1/2 top-1 translate-x-[26px] bg-emerald-700 text-white ring-2 ring-white/70"
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
