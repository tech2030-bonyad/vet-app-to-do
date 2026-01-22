export interface Veterinarian {
  id: string;
  name: string;
  specialization: string;
  avatar: string;
  rating: number;
  experience: number;
  availableSlots: string[];
  isAvailable: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  vetId: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
}

export interface Appointment {
  id: string;
  vetId: string;
  vetName: string;
  petId: string;
  petName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface BookingFormData {
  vetId: string;
  date: string;
  timeSlot: string;
  appointmentType: string;
  petId: string;
  notes?: string;
}