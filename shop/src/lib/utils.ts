import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees. */
export function formatCurrency(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Convert a product name to a URL-safe slug. */
export function generateSlug(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/** Generate a unique order number: SSS-YYYYMMDD-XXXX */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SSS-${date}-${random}`;
}

/** Get or create a session id for the cart (cookie-based). */
export function getCartSessionId(cookieValue?: string): string {
  if (cookieValue && cookieValue.length > 5) return cookieValue;
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Star rating helper — returns array of booleans for filled/half. */
export function getStars(rating: number): { filled: boolean; half: boolean }[] {
  const rounded = Math.round(rating * 2) / 2;
  return Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    if (rounded >= idx) return { filled: true, half: false };
    if (rounded >= idx - 0.5) return { filled: false, half: true };
    return { filled: false, half: false };
  });
}

/** Compute average rating from list of reviews. */
export function averageRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

/** Format date in Indian format. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Estimate delivery date — 2 days from now. */
export function estimatedDeliveryDate(days = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
