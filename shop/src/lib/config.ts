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

/** Delivery fee rules. */
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_THRESHOLD = 500;
