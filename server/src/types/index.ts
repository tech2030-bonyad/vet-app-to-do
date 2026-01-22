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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
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