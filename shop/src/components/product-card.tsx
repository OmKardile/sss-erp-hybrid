"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { resolveProductImage } from "@/lib/config";
import { AnimatedIcon } from "@/components/animated-icon";
import type { ProductListItem } from "@/lib/types";

interface ProductCardProps {
  product: ProductListItem;
}

/**
 * Quick-commerce product card — scannable in one glance:
 * photo → name → unit → price → add. Consistent square photo ratio.
 * The add control is a wide 40px-tall button (44px with card padding),
 * thumb-reachable inside the card's lower-right corner.
 */
export function ProductCard({ product }: ProductCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [imgError, setImgError] = useState(false);
  const [addSignal, setAddSignal] = useState(0);
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
    setAddSignal((s) => s + 1);
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

  const image = resolveProductImage(
    imgError ? null : product.image,
    product.category,
  );

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-[0_4px_20px_rgba(28,25,23,0.05)] backdrop-blur-md transition-[transform,box-shadow,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/90 hover:bg-white/85 hover:shadow-[0_14px_36px_rgba(28,25,23,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
    >
      {/* Real product photo — consistent square ratio; gentle zoom on hover */}
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {/* Discount badge — frosted glass over the photo */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
            {discount}% off
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/55">
            <span className="rounded-lg bg-white px-3 py-1 text-[11px] font-bold text-stone-900">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Body — one line each: name, unit */}
      <div className="flex flex-1 flex-col gap-0.5 p-2.5 sm:p-3">
        {product.brand && (
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-stone-400">
            {product.brand}
          </p>
        )}
        <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-tight text-stone-900 sm:text-sm">
          {product.name}
        </p>
        <p className="text-[11px] text-stone-500">{product.unitType}</p>

        {/* Price + wide add button */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col leading-tight">
            {discount > 0 && product.compareAtPrice && (
              <span className="text-[10px] text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="font-display text-[15px] font-semibold text-stone-900 sm:text-base">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "inline-flex h-10 min-w-[72px] items-center justify-center gap-1 rounded-full px-3.5 text-xs font-bold shadow-sm transition-[background-color,transform] duration-150 active:scale-[0.96] motion-reduce:active:scale-100",
              outOfStock
                ? "cursor-not-allowed bg-stone-200/80 text-stone-400"
                : status === "added"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-800 text-white hover:bg-emerald-900",
            )}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : status === "added" ? (
              <>
                <AnimatedIcon name="check-white" size={14} trigger="once" />{" "}
                Added
              </>
            ) : (
              <>
                <AnimatedIcon
                  name="plus"
                  size={14}
                  trigger="hover"
                  playSignal={addSignal}
                />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
