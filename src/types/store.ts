// Store-related TypeScript interfaces and types

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  brand?: string;
  weight?: string;
  age?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit' | 'debit' | 'paypal';
  last4?: string;
  expiryDate?: string;
}

export type ProductCategory = 
  | 'food'
  | 'toys'
  | 'accessories'
  | 'health'
  | 'grooming'
  | 'beds'
  | 'treats';

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}