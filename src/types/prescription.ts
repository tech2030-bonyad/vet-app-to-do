export interface Prescription {
  id: string;
  petId: string;
  petName: string;
  veterinarianId: string;
  veterinarianName: string;
  clinicName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedDate: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'discontinued';
  refillsRemaining: number;
  totalRefills: number;
  sideEffects?: string[];
  notes?: string;
  cost?: number;
  pharmacy?: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  type: 'prescription' | 'visit' | 'vaccination' | 'surgery' | 'test' | 'emergency';
  title: string;
  description: string;
  date: string;
  veterinarianName: string;
  clinicName: string;
  attachments?: string[];
  prescriptionId?: string;
  cost?: number;
  notes?: string;
}

export interface PrescriptionFilters {
  status?: 'active' | 'completed' | 'discontinued' | 'all';
  petId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  medicationType?: string;
}