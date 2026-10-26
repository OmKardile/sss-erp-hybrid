"use client";

import { useSyncExternalStore } from "react";
import { History } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getRecentlyViewedSnapshot } from "@/lib/recently-viewed";
import type { ProductListItem } from "@/lib/types";

const noopSubscribe = () => () => {};
const EMPTY: string[] = [];

/**
 * "Pick up where you left off" rail on the home page — mirrors how
 * quick-commerce apps resurface browsing history without an account.
 * Snapshot-based (no effect setState): renders nothing on the server,
 * the client history appears post-hydration.
 */
export function RecentlyViewed({
  products,
}: {
  products: ProductListItem[];
}) {
  const slugs = useSyncExternalStore(
    noopSubscribe,
    getRecentlyViewedSnapshot,
    () => EMPTY,
  );

  if (slugs.length === 0) return null;

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = slugs
    .map((s) => bySlug.get(s))
    .filter((p): p is ProductListItem => !!p)
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Recently viewed"
      className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8"
    >
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-semibold text-stone-900 sm:text-2xl">
            <History className="h-5 w-5 text-stone-400" aria-hidden />
            Recently viewed
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Pick up where you left off
          </p>
        </div>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
        {items.map((p) => (
          <div key={p.id} className="w-40 shrink-0 sm:w-48">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
