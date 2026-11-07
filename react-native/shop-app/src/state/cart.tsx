/**
 * Cart + local order history. Cart lives in the app (AsyncStorage-backed);
 * at live checkout the lines are pushed to the storefront's cart-session
 * API right before POST /api/checkout. In demo mode orders are created
 * locally and kept in history for the Orders tab.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProductListItem } from "../lib/types";
import { generateOrderNumber } from "../lib/api";
import type { CouponValidation } from "../lib/coupons";

const CART_KEY = "sss.cart.v1";
const ORDERS_KEY = "sss.orders.v1";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  unitType: string;
}

export interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  add: (p: ProductListItem, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
  /** Demo-mode order history (live orders are fetched from the API). */
  localOrders: LocalOrder[];
  saveLocalOrder: (o: LocalOrder) => void;
  /** Applied coupon — shared so it survives Cart → Checkout. */
  coupon: CouponValidation | null;
  setCoupon: (c: CouponValidation | null) => void;
}

export interface LocalOrder {
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: "COD" | "UPI";
  items: { name: string; price: number; quantity: number; lineTotal: number }[];
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}

function parseStored<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, o] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(ORDERS_KEY),
        ]);
        setLines(parseStored<CartLine[]>(c, []));
        setLocalOrders(parseStored<LocalOrder[]>(o, []));
      } catch {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(CART_KEY, JSON.stringify(lines)).catch(() => {});
  }, [lines, hydrated]);

  const add = useCallback((p: ProductListItem, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: Math.min(99, l.quantity + qty) }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          quantity: qty,
          image: p.image,
          unitType: p.unitType,
        },
      ];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) =>
            l.productId === productId ? { ...l, quantity: Math.min(99, qty) } : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const qtyOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.quantity ?? 0,
    [lines],
  );

  const saveLocalOrder = useCallback((o: LocalOrder) => {
    setLocalOrders((prev) => {
      const next = [o, ...prev].slice(0, 30);
      AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      qtyOf,
      localOrders,
      saveLocalOrder,
      coupon,
      setCoupon,
    }),
    [lines, itemCount, subtotal, add, setQty, remove, clear, qtyOf, localOrders, saveLocalOrder, coupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Build a demo-mode order (local order number, no server). */
export function buildLocalOrder(
  lines: CartLine[],
  totals: { subtotal: number; deliveryFee: number; total: number },
  paymentMethod: "COD" | "UPI",
): LocalOrder {
  return {
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    total: totals.total,
    paymentMethod,
    items: lines.map((l) => ({
      name: l.name,
      price: l.price,
      quantity: l.quantity,
      lineTotal: Math.round(l.price * l.quantity * 100) / 100,
    })),
  };
}
