export interface DemoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Strike-through price (was) */
  compareAtPrice?: number;
  categoryId: string;
  /** Tailwind gradient classes for product card image placeholder */
  gradient: string;
  /** Emoji for the product card */
  icon: string;
  sizes?: string[];
  colors?: DemoColor[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  inStock: boolean;
}

export interface DemoColor {
  name: string;
  /** Tailwind bg-* class or hex */
  value: string;
}

export interface DemoCategory {
  id: string;
  name: string;
  icon: string;
}

export interface DemoCartItem {
  productId: string;
  name: string;
  price: number;
  gradient: string;
  icon: string;
  size?: string;
  color?: string;
  quantity: number;
}

export type EcomView =
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'favorites';
