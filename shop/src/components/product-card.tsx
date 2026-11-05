"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { resolveProductImage } from "@/lib/config";
import { AnimatedIcon } from "@/components/animated-icon";
import { useI18n } from "@/components/locale-provider";
import { useMrName } from "@/lib/mr-names";
import type { ProductListItem } from "@/lib/types";

interface ProductCardProps {
  product: ProductListItem;
}

/**
 * Candy shelf card (DESIGN.md): white rounded card, photo zooms in its
 * clip on hover, mango price sticker, ink pill Add. The card lifts and
 * glows (one treatment per role).
 */
export function ProductCard({ product }: ProductCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [imgError, setImgError] = useState(false);
  const [addSignal, setAddSignal] = useState(0);
  const { t } = useI18n();
  const name = useMrName(product.name);
  const brand = useMrName(product.brand ?? "");
  const unit = useMrName(product.unitType);
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
      className={cn(
        "candy-card group relative flex h-full flex-col overflow-hidden",
        outOfStock && "opacity-70",
      )}
    >
      {/* Photo — zooms inside the rounded clip */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-[calc(1.5rem-1.5px)] bg-cream">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {discount > 0 && (
          <span className="sticker sticker--heat absolute left-2.5 top-2.5 !rotate-[-4deg] text-[11px]">
            −{discount}%
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-ink px-4 py-1.5 font-data text-[11px] font-bold text-cream">
              {t("card.out-of-stock")}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        {product.brand && brand && (
          <p className="font-data text-[10px] uppercase tracking-[0.1em] text-sage">
            {brand}
          </p>
        )}
        <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-tight text-ink sm:text-sm">
          {name}
        </p>
        <p className="text-[11px] text-sage">{unit}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className={cn("sticker", outOfStock && "opacity-60")}>
            {discount > 0 && product.compareAtPrice && (
              <s>{formatCurrency(product.compareAtPrice)}</s>
            )}
            {formatCurrency(product.price)}
          </span>

          <button
            type="button"
            onClick={addToCart}
            disabled={outOfStock}
            aria-label={t("card.add-aria", { name })}
            className={cn(
              "pop-btn inline-flex h-10 min-w-[72px] items-center justify-center gap-1 px-4 text-xs font-bold",
              outOfStock &&
                "cursor-not-allowed bg-cream text-sage shadow-none hover:bg-cream hover:translate-y-0",
              status === "added" && "bg-pine hover:bg-pine",
            )}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : status === "added" ? (
              <>
                <AnimatedIcon name="check-white" size={14} trigger="once" />{" "}
                {t("card.added")}
              </>
            ) : (
              <>
                <AnimatedIcon
                  name="plus"
                  size={14}
                  trigger="hover"
                  playSignal={addSignal}
                />
                {t("card.add")}
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
