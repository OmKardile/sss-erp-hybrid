/** Type definitions shared across the storefront. */

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

export interface CartItemView {
  id: string;
  productId: string;
  quantity: number;
  product: ProductListItem;
}

export interface CartTotals {
  items: CartItemView[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
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
  /** Coupon code applied at checkout (null when none). */
  couponCode: string | null;
  /** Rupee discount from the applied coupon. */
  discountTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
}
