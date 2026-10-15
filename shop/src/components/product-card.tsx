"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Package,
  Plus,
  Check,
  Loader2,
  Apple,
  Milk,
  Cookie,
  Beef,
  Coffee,
  Sparkles,
  Home,
  ShoppingCart,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types";

const CATEGORY_STYLES: Record<string, { bg: string; icon: any }> = {
  "Fruits & Vegetables": { bg: "bg-gradient-to-br from-green-400 to-emerald-500", icon: Apple },
  Dairy: { bg: "bg-gradient-to-br from-blue-400 to-cyan-500", icon: Milk },
  Snacks: { bg: "bg-gradient-to-br from-amber-400 to-orange-500", icon: Cookie },
  Groceries: { bg: "bg-gradient-to-br from-emerald-400 to-teal-500", icon: ShoppingCart },
  "Personal Care": { bg: "bg-gradient-to-br from-pink-400 to-rose-500", icon: Sparkles },
  Household: { bg: "bg-gradient-to-br from-violet-400 to-purple-500", icon: Home },
  Bakery: { bg: "bg-gradient-to-br from-orange-400 to-amber-500", icon: Cookie },
  Beverages: { bg: "bg-gradient-to-br from-cyan-400 to-blue-500", icon: Coffee },
};

function getCategoryBg(category?: string | null): string {
  if (!category) return "bg-gradient-to-br from-slate-300 to-slate-400";
  return CATEGORY_STYLES[category]?.bg || "bg-gradient-to-br from-emerald-400 to-teal-500";
}

function CategoryIcon({ category }: { category?: string | null }) {
  const Icon = (category && CATEGORY_STYLES[category]?.icon) || Package;
  return <Icon className="h-10 w-10 text-white/40" />;
}

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const outOfStock = product.stock <= 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading" || outOfStock) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        setStatus("added");
        window.dispatchEvent(new Event("sss:cart-changed"));
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      {/* Image / placeholder */}
      <div className={cn("relative aspect-square w-full overflow-hidden", getCategoryBg(product.category))}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <CategoryIcon category={product.category} />
            <span className="text-3xl font-black text-white/30">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow">
              Featured
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {product.name}
            </p>
            {product.brand && (
              <p className="truncate text-xs text-slate-500">{product.brand}</p>
            )}
          </div>
          {product.category && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              {product.category}
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400">{product.unitType}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.compareAtPrice && discount > 0 && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1 rounded-full px-3 text-xs font-semibold transition",
              outOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : status === "added"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95",
            )}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "added" ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
