/**
 * Coupon system — shared, pure logic.
 *
 * The customer enters a code at checkout. The checkout UI validates
 * optimistically with this module for instant feedback; the checkout API
 * re-validates with the same module before creating the order, so the
 * server stays authoritative (client-side prices are never trusted).
 *
 * Coupon families:
 *  - FIRST50  always on  — ₹50 off orders above ₹499 (first-order friendly)
 *  - FREESHIP always on  — free delivery on orders above ₹199
 *  - festive  window-scoped — derived from the active festive theme
 *    (see src/lib/festive.ts). Valid only while that theme is active.
 */

import { getActiveTheme } from "./festive";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "./config";

export interface CouponDef {
  code: string;
  description: string;
  minSubtotal: number;
  percentOff?: number;
  flatOff?: number;
  maxDiscount?: number;
  freeDeliveryOnly?: boolean;
}

/** Always-available store coupons. */
export const STORE_COUPONS: CouponDef[] = [
  {
    code: "FIRST50",
    description: "₹50 off orders above ₹499",
    minSubtotal: 499,
    flatOff: 50,
  },
  {
    code: "FREESHIP",
    description: "Free delivery on orders above ₹199",
    minSubtotal: 199,
    freeDeliveryOnly: true,
  },
];

/** All coupons currently offered (store + active festive window). */
export function availableCoupons(now: Date = new Date()): CouponDef[] {
  const theme = getActiveTheme(now);
  const festive: CouponDef[] = theme?.coupon
    ? [
        {
          code: theme.coupon.code,
          description: theme.coupon.text,
          minSubtotal: theme.coupon.minSubtotal,
          percentOff: theme.coupon.percentOff,
          flatOff: theme.coupon.flatOff,
          maxDiscount: theme.coupon.maxDiscount,
        },
      ]
    : [];
  return [...festive, ...STORE_COUPONS];
}

export interface CouponValidation {
  ok: boolean;
  coupon?: CouponDef;
  /** Rupee discount on the subtotal (0 for free-delivery coupons). */
  discount: number;
  /** Whether the coupon zeroes the delivery fee. */
  freeDelivery: boolean;
  /** Human-readable failure reason (when !ok). */
  reason?: string;
}

/**
 * Validate a coupon code against a subtotal. Pure — used by both the
 * checkout page (UX) and the checkout API (authoritative).
 */
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
    return {
      ok: false,
      discount: 0,
      freeDelivery: false,
      reason: "This coupon isn't active right now",
    };
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
    return {
      ok: false,
      discount: 0,
      freeDelivery: false,
      reason: "Coupon gives no discount on this cart",
    };
  }
  return { ok: true, coupon, discount, freeDelivery };
}

/** Compute final totals the same way on client and server. */
export function computeTotals(
  subtotal: number,
  coupon: CouponValidation | null,
): {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
} {
  const discount = coupon?.ok ? coupon.discount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const freeDelivery =
    coupon?.ok &&
    (coupon.freeDelivery || discountedSubtotal >= FREE_DELIVERY_THRESHOLD);
  const deliveryFee = freeDelivery || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    discount,
    deliveryFee,
    total: discountedSubtotal + deliveryFee,
  };
}
