"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Check, Loader2, BadgePercent } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { resolveProductImage } from "@/lib/config";
import { discountPct } from "@/lib/deal";
import { useActiveTheme } from "@/lib/use-active-theme";
import type { ProductListItem } from "@/lib/types";

/**
 * Deal of the Day — one wide, scannable banner card near the top of the
 * home page (quick-commerce pattern). Rotates daily; the auto-improver can
 * pin a curated pick. Static styling — no countdown animation, no motion.
 */
export function DealOfDay({ deal }: { deal: ProductListItem | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [imgError, setImgError] = useState(false);
  const theme = useActiveTheme();
  if (!deal) return null;
  const pct = discountPct(deal);
  const image = resolveProductImage(imgError ? null : deal.image, deal.category);
  const outOfStock = deal.stock <= 0;

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (status === "loading" || outOfStock) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: deal!.id, quantity: 1 }),
      });
      if (res.ok) {
        setStatus("added");
        window.dispatchEvent(new Event("sss:cart-changed"));
        setTimeout(() => setStatus("idle"), 1400);
      } else setStatus("idle");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <section
      aria-label="Deal of the day"
      className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        {/* Photo */}
        <Link
          href={`/product/${deal.slug}`}
          className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-amber-100 bg-white sm:h-24 sm:w-24"
        >
          <img
            src={image}
            alt={deal.name}
            className="h-full w-full object-cover"
          />
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-950">
            <BadgePercent className="h-3 w-3" aria-hidden />
            {theme ? theme.badgeLabel : "Deal of the day"}
          </p>
          <Link
            href={`/product/${deal.slug}`}
            className="mt-1.5 block truncate font-display text-lg font-semibold text-stone-900 sm:text-xl"
          >
            {deal.name}
          </Link>
          <p className="text-xs text-stone-600">
            {deal.brand ? `${deal.brand} · ` : ""}
            {deal.unitType}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-stone-900">
              {formatCurrency(deal.price)}
            </span>
            {pct > 0 && deal.compareAtPrice && (
              <>
                <span className="text-sm text-stone-400 line-through">
                  {formatCurrency(deal.compareAtPrice)}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  {pct}% off
                </span>
              </>
            )}
          </div>
        </div>

        {/* Add */}
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            aria-label={`Add ${deal.name} to cart`}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-bold",
              outOfStock
                ? "cursor-not-allowed bg-stone-200 text-stone-400"
                : status === "added"
                  ? "bg-emerald-700 text-white"
                  : "bg-orange-900 text-amber-50 hover:bg-orange-950",
            )}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : status === "added" ? (
              <>
                <Check className="h-4 w-4" aria-hidden /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden />
                {outOfStock ? "Out of stock" : "Add to cart"}
              </>
            )}
          </button>
          <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500">
            New deal tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
