"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  Check,
  Loader2,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Star,
  ArrowRight,
  Package,
  MessageSquarePlus,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { StarRating } from "@/components/star-rating";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Toast } from "@/components/toast";
import { Button } from "@/components/ui-button";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { resolveProductImage } from "@/lib/config";
import type { ProductDetail, ProductListItem } from "@/lib/types";

interface Props {
  product: ProductDetail;
  related: ProductListItem[];
}

export function ProductDetailClient({ product, related }: Props) {
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
  }>({ open: false, msg: "" });

  const outOfStock = product.stock <= 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  const image = resolveProductImage(product.image, product.category);

  async function addToCart() {
    if (status === "loading" || outOfStock) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (res.ok) {
        setStatus("added");
        setToast({ open: true, msg: `${qty} × ${product.name} added to cart` });
        window.dispatchEvent(new Event("sss:cart-changed"));
        setTimeout(() => setStatus("idle"), 1500);
      } else {
        setStatus("idle");
        setToast({ open: true, msg: "Failed to add to cart" });
      }
    } catch {
      setStatus("idle");
      setToast({ open: true, msg: "Network error" });
    }
  }

  async function buyNow() {
    if (outOfStock) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event("sss:cart-changed"));
        window.location.href = "/checkout";
      } else {
        setStatus("idle");
        setToast({ open: true, msg: "Failed — please try again" });
      }
    } catch {
      setStatus("idle");
      setToast({ open: true, msg: "Network error" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <Toast
        open={toast.open}
        message={toast.msg}
        type="success"
        onClose={() => setToast({ open: false, msg: "" })}
      />

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">
          Home
        </Link>
        <ChevronLeft className="h-3 w-3 rotate-180" />
        {product.category && (
          <>
            <Link
              href={`/?category=${encodeURIComponent(product.category)}`}
              className="hover:text-emerald-700"
            >
              {product.category}
            </Link>
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </>
        )}
        <span className="truncate text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Real product photo */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-md sm:aspect-[4/3] lg:aspect-square">
          <img
            src={image}
            alt={product.name}
            className="relative h-full w-full object-cover"
          />

          {/* Badges */}
          <div className="absolute left-4 top-4 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-md bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                -{discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {product.brand}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {product.unitType}
            </span>
          </div>

          <h1 className="font-display mt-3 text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl">
            {product.name}
          </h1>

          {product.reviewCount > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRating
                rating={product.avgRating}
                showValue
                count={product.reviewCount}
              />
              <a
                href="#reviews"
                className="text-xs text-emerald-700 hover:underline"
              >
                Read reviews
              </a>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              No reviews yet — be the first to review!
            </p>
          )}

          {/* Price */}
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-emerald-50 p-4">
            <span className="font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
              {formatCurrency(product.price)}
            </span>
            {discount > 0 && product.compareAtPrice && (
              <span className="text-base text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="mb-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
                Save {formatCurrency(product.compareAtPrice! - product.price)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Price inclusive of all taxes
          </p>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Out of stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Only {product.stock} left — order soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                In stock
              </span>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={qty}
              min={1}
              max={Math.max(1, Math.min(99, product.stock))}
              onChange={setQty}
            />
            <Button
              onClick={addToCart}
              disabled={outOfStock || status === "loading"}
              variant="outline"
              size="lg"
              className="flex-1 min-w-[150px] border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "added" ? (
                <>
                  <Check className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </>
              )}
            </Button>
            <Button
              onClick={buyNow}
              disabled={outOfStock || status === "loading"}
              size="lg"
              className="flex-1 min-w-[150px]"
            >
              Buy Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Perks */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
            <div>
              <Truck className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-[11px] text-slate-600">
                Free delivery ₹500+
              </p>
            </div>
            <div>
              <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-[11px] text-slate-600">Quality assured</p>
            </div>
            <div>
              <Package className="mx-auto h-5 w-5 text-emerald-600" />
              <p className="mt-1 text-[11px] text-slate-600">Easy returns</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold text-stone-900 sm:text-2xl">
            Reviews
          </h2>
          <span className="text-sm text-slate-500">
            {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {/* Rating summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-4xl font-bold text-slate-900">
              {product.avgRating.toFixed(1)}
            </p>
            <StarRating rating={product.avgRating} size={18} />
            <p className="mt-1 text-xs text-slate-500">
              Based on {product.reviewCount} review
              {product.reviewCount === 1 ? "" : "s"}
            </p>

            <ReviewForm
              productSlug={product.slug}
              onAdded={() => window.location.reload()}
            />
          </div>

          {/* Review list */}
          <div className="lg:col-span-2">
            {product.reviews.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-100 bg-emerald-50/40 text-center">
                <MessageSquarePlus className="h-10 w-10 text-emerald-400" />
                <p className="text-sm text-slate-500">No reviews yet</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {product.reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                          {r.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {r.customerName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(r.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewForm({
  productSlug,
  onAdded,
}: {
  productSlug: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Please enter your name");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productSlug,
          customerName: name.trim(),
          rating,
          comment: comment.trim() || null,
        }),
      });
      if (res.ok) {
        onAdded();
      } else {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || "Failed to submit");
      }
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
      >
        Write a review
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 space-y-3 border-t border-slate-100 pt-4"
    >
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400"
      />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition",
                n <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200",
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
      />
      {err && <p className="text-xs text-rose-600">{err}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading} className="flex-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
        </Button>
      </div>
    </form>
  );
}
