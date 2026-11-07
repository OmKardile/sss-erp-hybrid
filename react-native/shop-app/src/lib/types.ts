/** Shared types for the Shubham Super Shopee shop app (ported from the web storefront). */

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  brand: string | null;
  category: string | null;
  unitType: string;
  stock: number;
  image: string | null;
  isFeatured: boolean;
}

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  isActive: boolean;
  reviews: ProductReview[];
  avgRating: number;
  reviewCount: number;
}

export interface OrderItemView {
  id: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  city: string | null;
  pincode: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
  discountTotal: number;
  paymentMethod: "COD" | "UPI";
  paymentStatus: string;
  orderStatus: string;
  notes: string | null;
  createdAt: string;
  items: OrderItemView[];
  /** Demo/local orders carry the line items already; live orders too. */
  source?: "live" | "local";
}

export interface ProductsResponse {
  items: ProductListItem[];
  count: number;
  categories: string[];
}
