/**
 * Deal of the Day — deterministic daily rotation.
 *
 * Picks one discounted, in-stock product per day using a stable date hash,
 * so every visitor sees the same deal all day (no per-request randomness)
 * and it rotates itself at midnight IST without any server state.
 *
 * The auto-improver service can pin a hand-picked deal by writing
 * `deal.slug` into src/config/improvement-state.json; when the pinned
 * product exists and is in stock it wins over the deterministic pick.
 */

import type { ProductListItem } from "./types";

/** products with a real discount (compareAtPrice above price) */
export function dealCandidates(products: ProductListItem[]): ProductListItem[] {
  return products.filter(
    (p) =>
      p.stock > 0 &&
      p.compareAtPrice != null &&
      p.compareAtPrice > p.price,
  );
}

/** Discount percentage for a product (0 when none). */
export function discountPct(p: ProductListItem): number {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

/** Stable 32-bit string hash (FNV-1a) — same input, same output. */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic deal for a given IST date string (YYYY-MM-DD). */
export function pickDailyDeal(
  products: ProductListItem[],
  dateStr: string,
): ProductListItem | null {
  const candidates = dealCandidates(products);
  if (candidates.length === 0) return null;
  const idx = hashStr("sss-deal-" + dateStr) % candidates.length;
  return candidates[idx];
}
