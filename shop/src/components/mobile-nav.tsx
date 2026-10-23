"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, ShoppingCart } from "lucide-react";
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
      className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:hidden safe-area-pb"
    >
      <Link
        href="/"
        aria-current={isHome ? "page" : undefined}
        className={cn(
          "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          isHome ? "text-emerald-700" : "text-stone-500",
        )}
      >
        <Home className="h-5 w-5" aria-hidden />
        Home
      </Link>
      <Link
        href="/#categories"
        className={cn(
          "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          !isHome && !isCart ? "text-emerald-700" : "text-stone-500",
        )}
      >
        <LayoutGrid className="h-5 w-5" aria-hidden />
        Shop
      </Link>
      <Link
        href="/cart"
        aria-current={isCart ? "page" : undefined}
        className={cn(
          "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
          isCart ? "text-emerald-700" : "text-stone-500",
        )}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden />
        Cart
        {count > 0 && (
          <span
            aria-label={`${count} items in cart`}
            className="absolute right-1/2 top-1.5 flex h-5 min-w-[20px] translate-x-[26px] items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </nav>
  );
}
