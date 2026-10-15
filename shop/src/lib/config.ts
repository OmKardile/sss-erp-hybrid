/**
 * Centralized store config — read from NEXT_PUBLIC_* env vars.
 * Falls back to sensible defaults so the app never breaks.
 */
export const STORE_CONFIG = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Shubham Super Shopee",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+91 98765 43210",
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Pune, Maharashtra, India",
  upiId: process.env.NEXT_PUBLIC_UPI_ID || "shubhamsupershopee@upi",
};

/** Default category list for filter chips. */
export const DEFAULT_CATEGORIES = [
  "All",
  "Groceries",
  "Dairy",
  "Snacks",
  "Beverages",
  "Personal Care",
  "Household",
  "Bakery",
  "Fruits & Vegetables",
];

/** Emoji icons for each category — used on tiles and product cards. */
export const CATEGORY_EMOJI: Record<string, string> = {
  "Fruits & Vegetables": "🥬",
  Dairy: "🥛",
  Snacks: "🍪",
  Groceries: "🍚",
  "Personal Care": "🧴",
  Household: "🧹",
  Bakery: "🍞",
  Beverages: "🥤",
};

/** Gradient color classes per category — used for tiles and card backgrounds. */
export const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Vegetables": "from-green-400 to-emerald-500",
  Dairy: "from-blue-400 to-cyan-500",
  Snacks: "from-amber-400 to-orange-500",
  Groceries: "from-emerald-400 to-teal-500",
  "Personal Care": "from-pink-400 to-rose-500",
  Household: "from-violet-400 to-purple-500",
  Bakery: "from-orange-400 to-amber-500",
  Beverages: "from-cyan-400 to-blue-500",
};

/** Fallback gradient when category is unknown. */
export const DEFAULT_CATEGORY_COLOR = "from-emerald-400 to-teal-500";

/** Get emoji for a category (falls back to 🛒). */
export function getCategoryEmoji(category?: string | null): string {
  if (!category) return "🛒";
  return CATEGORY_EMOJI[category] ?? "🛒";
}

/** Get gradient classes for a category (falls back to emerald/teal). */
export function getCategoryColor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}

/** Delivery fee rules. */
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_THRESHOLD = 500;
