"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setCount(data?.itemCount ?? 0);
      } catch {
        /* ignore */
      }
    };
    refresh();
    window.addEventListener("sss:cart-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("sss:cart-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
    >
      <ShoppingCart className="h-5 w-5" />
      <span>Cart</span>
      {count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
