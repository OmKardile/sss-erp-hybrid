/**
 * Coupon system — ported from the web storefront (src/lib/coupons.ts).
 * The festive window is kept minimal: Diwali 20 Oct – 14 Nov (2026 dates
 * from the web app's festive calendar; marketing-grade, ±2 days).
 */

export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_THRESHOLD = 500;

export interface CouponDef {
  code: string;
  description: string;
  minSubtotal: number;
  percentOff?: number;
  flatOff?: number;
  maxDiscount?: number;
  freeDeliveryOnly?: boolean;
}

export const STORE_COUPONS: CouponDef[] = [
  { code: "FIRST50", description: "₹50 off orders above ₹499", minSubtotal: 499, flatOff: 50 },
  { code: "FREESHIP", description: "Free delivery on orders above ₹199", minSubtotal: 199, freeDeliveryOnly: true },
];

/** Diwali festive window (matches the web storefront's active theme). */
function inDiwaliWindow(d: Date): boolean {
  const y = d.getFullYear();
  const start = new Date(y, 9, 20); // 20 Oct
  const end = new Date(y, 10, 14); // 14 Nov
  return d >= start && d <= end;
}

export function availableCoupons(now: Date = new Date()): CouponDef[] {
  const festive: CouponDef[] = inDiwaliWindow(now)
    ? [
        {
          code: "DIWALI10",
          description: "10% off orders above ₹299 (up to ₹150)",
          minSubtotal: 299,
          percentOff: 10,
          maxDiscount: 150,
        },
      ]
    : [];
  return [...festive, ...STORE_COUPONS];
}

export interface CouponValidation {
  ok: boolean;
  coupon?: CouponDef;
  discount: number;
  freeDelivery: boolean;
  reason?: string;
}

export function validateCoupon(
  rawCode: string,
  subtotal: number,
  now: Date = new Date(),
): CouponValidation {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { ok: false, discount: 0, freeDelivery: false, reason: "Enter a coupon code" };
  }
  const coupon = availableCoupons(now).find((c) => c.code === code);
  if (!coupon) {
    return { ok: false, discount: 0, freeDelivery: false, reason: "This coupon isn't active right now" };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      discount: 0,
      freeDelivery: false,
      reason: `Add items worth ₹${coupon.minSubtotal - subtotal} more to use ${code}`,
    };
  }
  let discount = 0;
  if (coupon.percentOff) {
    discount = Math.round((subtotal * coupon.percentOff) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.flatOff) {
    discount = Math.min(coupon.flatOff, subtotal);
  }
  const freeDelivery = !!coupon.freeDeliveryOnly;
  if (discount === 0 && !freeDelivery) {
    return { ok: false, discount: 0, freeDelivery: false, reason: "Coupon gives no discount on this cart" };
  }
  return { ok: true, coupon, discount, freeDelivery };
}

export function computeTotals(
  subtotal: number,
  coupon: CouponValidation | null,
): { subtotal: number; discount: number; deliveryFee: number; total: number } {
  const discount = coupon?.ok ? coupon.discount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const freeDelivery =
    coupon?.ok && (coupon.freeDelivery || discountedSubtotal >= FREE_DELIVERY_THRESHOLD);
  const deliveryFee = freeDelivery || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    discount,
    deliveryFee,
    total: discountedSubtotal + deliveryFee,
  };
}

/** Deterministic deal-of-the-day pick (same FNV-1a hash as the web app). */
function hashStr(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function dealCandidates<T extends { stock: number; compareAtPrice: number | null; price: number }>(
  products: T[],
): T[] {
  return products.filter((p) => p.stock > 0 && p.compareAtPrice != null && p.compareAtPrice > p.price);
}

export function discountPct(p: { compareAtPrice: number | null; price: number }): number {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
}

export function dealOfTheDay<T extends { slug: string } & Parameters<typeof dealCandidates>[0][number]>(
  products: T[],
  now: Date = new Date(),
): T | null {
  const candidates = dealCandidates(products);
  if (candidates.length === 0) return null;
  // IST date key (UTC+5:30)
  const ist = new Date(now.getTime() + (5.5 * 60 + now.getTimezoneOffset()) * 60000);
  const key = `${ist.getFullYear()}-${ist.getMonth() + 1}-${ist.getDate()}`;
  return candidates[hashStr(key) % candidates.length];
}
