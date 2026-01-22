/**
 * Appointment model interface and type definitions
 */

export interface Appointment {
  id: string;
  userId: string;
  vetId: string;
  petId: string;
  appointmentType: AppointmentType;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  cost?: number;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export enum AppointmentType {
  CHECKUP = 'checkup',
  VACCINATION = 'vaccination',
  EMERGENCY = 'emergency',
  SURGERY = 'surgery',
  DENTAL = 'dental',
  GROOMING = 'grooming',
  CONSULTATION = 'consultation'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export interface CreateAppointmentRequest {
  vetId: string;
  petId: string;
  appointmentType: AppointmentType;
  date: string;
  startTime: string;
  reason: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  vetId?: string;
  date?: string;
  startTime?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface RescheduleAppointmentRequest {
  vetId?: string;
  date: string;
  startTime: string;
  reason?: string;
}

export interface CancelAppointmentRequest {
  reason: string;
}

export interface AppointmentResponse {
  id: string;
  vetName: string;
  petName: string;
  appointmentType: AppointmentType;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  estimatedDuration: number;
  cost?: number;
  createdAt: string;
}

export interface AppointmentListResponse {
  appointments: AppointmentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface AppointmentConflict {
  conflictingAppointmentId: string;
  conflictTime: {
    date: string;
    startTime: string;
    endTime: string;
  };
}