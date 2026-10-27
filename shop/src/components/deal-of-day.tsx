"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { resolveProductImage } from "@/lib/config";
import { discountPct } from "@/lib/deal";
import { useActiveTheme } from "@/lib/use-active-theme";
import { QuantityStepper } from "@/components/quantity-stepper";
import { AnimatedIcon } from "@/components/animated-icon";
import { DealCountdown } from "@/components/countdown";
import type { ProductListItem } from "@/lib/types";

/**
 * Deal of the Day — one wide, scannable banner card near the top of the
 * home page (quick-commerce pattern). Rotates daily; the auto-improver can
 * pin a curated pick. Static styling — no countdown animation, no motion.
 */
export function DealOfDay({ deal }: { deal: ProductListItem | null }) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [imgError, setImgError] = useState(false);
  const [addSignal, setAddSignal] = useState(0);
  const theme = useActiveTheme();
  if (!deal) return null;
  const pct = discountPct(deal);
  const image = resolveProductImage(imgError ? null : deal.image, deal.category);
  const outOfStock = deal.stock <= 0;

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (status === "loading" || outOfStock) return;
    setStatus("loading");
    setAddSignal((s) => s + 1);
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
    <section aria-label="Deal of the day" className="pt-0">
      {/* Deep amber→rose gradient panel with refracting glass orbs.
          The photo sits in a frosted frame; the CTA is a white pill. */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 p-4 shadow-[0_16px_44px_rgba(190,60,20,0.28)] sm:p-5">
        {/* Glass orbs — light refracting through the panel */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-14 -top-16 h-52 w-52 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-10 h-44 w-44 rounded-full bg-yellow-200/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Photo — frosted frame */}
          <Link
            href={`/product/${deal.slug}`}
            className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-white/30 bg-white/10 p-1 backdrop-blur-sm sm:h-28 sm:w-28"
          >
            <img
              src={image}
              alt={deal.name}
              className="h-full w-full rounded-xl object-cover"
            />
          </Link>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <AnimatedIcon name="fire" size={12} trigger="loop" speed={0.6} />
              {theme ? theme.badgeLabel : "Deal of the day"}
            </p>
            <Link
              href={`/product/${deal.slug}`}
              className="mt-1.5 block truncate font-display text-lg font-semibold text-white drop-shadow-[0_1px_6px_rgba(120,30,0,0.35)] sm:text-xl"
            >
              {deal.name}
            </Link>
            <p className="text-xs text-amber-100">
              {deal.brand ? `${deal.brand} · ` : ""}
              {deal.unitType}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-white">
                {formatCurrency(deal.price)}
              </span>
              {pct > 0 && deal.compareAtPrice && (
                <>
                  <span className="text-sm text-amber-100/80 line-through">
                    {formatCurrency(deal.compareAtPrice)}
                  </span>
                  <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-bold text-orange-950">
                    {pct}% off
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Add + live countdown to the next midnight IST (deal rotation) */}
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2.5">
            <button
              type="button"
              onClick={addToCart}
              disabled={outOfStock}
              aria-label={`Add ${deal.name} to cart`}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-6 text-sm font-bold shadow-lg transition-[background-color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
                outOfStock
                  ? "cursor-not-allowed bg-white/40 text-white/70"
                  : status === "added"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-orange-950 hover:bg-amber-50",
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
                  {outOfStock ? "Out of stock" : "Add to cart"}
                </>
              )}
            </button>
            <DealCountdown variant="onDark" className="sm:pr-1" />
          </div>
        </div>
      </div>
    </section>
  );
}
