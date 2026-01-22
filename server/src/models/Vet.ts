/**
 * Veterinarian model interface and type definitions
 */

export interface Vet {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  licenseNumber: string;
  experience: number; // years of experience
  rating: number;
  availability: VetAvailability;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VetAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  isAvailable: boolean;
}

export interface CreateVetRequest {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  licenseNumber: string;
  experience: number;
  availability: VetAvailability;
}

export interface UpdateVetRequest extends Partial<CreateVetRequest> {
  isActive?: boolean;
  rating?: number;
}

export interface VetResponse {
  id: string;
  name: string;
  specialization: string[];
  experience: number;
  rating: number;
  availability: VetAvailability;
  isActive: boolean;
}

export interface VetListResponse {
  vets: VetResponse[];
  total: number;
  page: number;
  limit: number;
}