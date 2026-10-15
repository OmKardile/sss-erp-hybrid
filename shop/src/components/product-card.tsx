"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { getCategoryColor, getCategoryEmoji } from "@/lib/config";
import type { ProductListItem } from "@/lib/types";

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
        setTimeout(() => setStatus("idle"), 1400);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  const gradient = getCategoryColor(product.category);
  const emoji = getCategoryEmoji(product.category);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md tap-scale"
    >
      {/* Image / gradient placeholder with emoji */}
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-gradient-to-br",
          gradient,
        )}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="select-none text-5xl drop-shadow-md transition duration-300 group-hover:scale-110 sm:text-6xl">
              {emoji}
            </span>
          </div>
        )}

        {/* Decorative blurred blob */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />

        {/* Discount badge (top-left, red) */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            -{discount}%
          </span>
        )}

        {/* Featured ribbon (top-right, amber) */}
        {product.isFeatured && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-md">
            ⭐
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-900 shadow">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        {/* Brand */}
        {product.brand && (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
          {product.name}
        </p>

        {/* Unit */}
        <p className="text-[11px] text-slate-500">{product.unitType}</p>

        {/* Price + ADD */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col leading-tight">
            {discount > 0 && product.compareAtPrice && (
              <span className="text-[10px] text-slate-400 line-through">
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
              "inline-flex h-8 items-center justify-center gap-1 rounded-full px-3 text-xs font-bold uppercase tracking-wide transition active:scale-90",
              outOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : status === "added"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
            )}
          >
            {status === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === "added" ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
