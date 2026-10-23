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

/**
 * Real photography for each category — served from /public/products/.
 * Used on category tiles and as the fallback image for products that
 * don't have their own photo set.
 */
export const CATEGORY_IMAGE: Record<string, string> = {
  "Fruits & Vegetables": "/products/cat-fruits-vegetables.jpg",
  Dairy: "/products/cat-dairy.jpg",
  Snacks: "/products/cat-snacks.jpg",
  Groceries: "/products/cat-groceries.jpg",
  "Personal Care": "/products/cat-personal-care.jpg",
  Household: "/products/cat-household.jpg",
  Bakery: "/products/cat-bakery.jpg",
  Beverages: "/products/cat-beverages.jpg",
};

/** Generic fallback photo when the category is unknown. */
export const DEFAULT_CATEGORY_IMAGE = "/products/cat-groceries.jpg";

/** Get the category photo (local path under /public/products). */
export function getCategoryImage(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_IMAGE;
  return CATEGORY_IMAGE[category] ?? DEFAULT_CATEGORY_IMAGE;
}

/**
 * Resolve the best image for a product:
 * 1. the product's own photo (set by seed / ERP sync / admin),
 * 2. otherwise the category photo,
 * 3. otherwise the generic grocery photo.
 */
export function resolveProductImage(
  image?: string | null,
  category?: string | null,
): string {
  const img = (image || "").trim();
  if (img) return img;
  return getCategoryImage(category);
}

/** Delivery fee rules. */
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_THRESHOLD = 500;
