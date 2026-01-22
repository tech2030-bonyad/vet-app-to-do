/**
 * Type definitions for the Pet Care API
 */

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'vet';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  age: number;
  weight?: number;
  color?: string;
  gender: 'male' | 'female';
  isNeutered: boolean;
  medicalHistory?: string;
  allergies?: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  vetId?: string;
  type: 'checkup' | 'vaccination' | 'surgery' | 'emergency' | 'consultation';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  dateTime: string;
  duration: number; // in minutes
  reason: string;
  notes?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  petId: string;
  vetId: string;
  medications: Medication[];
  instructions: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'toys' | 'accessories' | 'health' | 'grooming';
  price: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  brand?: string;
  rating: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthRequest extends Express.Request {
  user?: User;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterQuery extends PaginationQuery {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}