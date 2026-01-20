import { create } from 'zustand';
import { Appointment, Veterinarian, AppointmentType } from '../types/appointment';

interface AppointmentStore {
  appointments: Appointment[];
  veterinarians: Veterinarian[];
  appointmentTypes: AppointmentType[];
  selectedVet: Veterinarian | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  selectedAppointmentType: AppointmentType | null;
  
  // Actions
  setSelectedVet: (vet: Veterinarian) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTimeSlot: (timeSlot: string) => void;
  setSelectedAppointmentType: (type: AppointmentType) => void;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (appointmentId: string) => void;
  clearBookingSelection: () => void;
  loadVeterinarians: () => void;
  loadAppointmentTypes: () => void;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  veterinarians: [],
  appointmentTypes: [],
  selectedVet: null,
  selectedDate: null,
  selectedTimeSlot: null,
  selectedAppointmentType: null,

  setSelectedVet: (vet) => set({ selectedVet: vet }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  setSelectedAppointmentType: (type) => set({ selectedAppointmentType: type }),

  addAppointment: (appointment) => 
    set((state) => ({ 
      appointments: [...state.appointments, appointment] 
    })),

  cancelAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      )
    })),

  clearBookingSelection: () => 
    set({
      selectedVet: null,
      selectedDate: null,
      selectedTimeSlot: null,
      selectedAppointmentType: null,
    }),

  loadVeterinarians: () => {
    // Mock data - replace with actual API call
    const mockVets: Veterinarian[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialization: 'General Practice',
        avatar: 'https://example.com/avatar1.jpg',
        rating: 4.8,
        experience: 8,
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        isAvailable: true,
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        specialization: 'Surgery',
        avatar: 'https://example.com/avatar2.jpg',
        rating: 4.9,
        experience: 12,
        availableSlots: ['10:00', '11:00', '13:00', '16:00'],
        isAvailable: true,
      },
      {
        id: '3',
        name: 'Dr. Emily Rodriguez',
        specialization: 'Dermatology',
        avatar: 'https://example.com/avatar3.jpg',
        rating: 4.7,
        experience: 6,
        availableSlots: ['09:00', '14:00', '15:00', '16:00'],
        isAvailable: false,
      },
    ];
    set({ veterinarians: mockVets });
  },

  loadAppointmentTypes: () => {
    // Mock data - replace with actual API call
    const mockTypes: AppointmentType[] = [
      {
        id: '1',
        name: 'General Checkup',
        duration: 30,
        price: 75,
        description: 'Routine health examination',
      },
      {
        id: '2',
        name: 'Vaccination',
        duration: 15,
        price: 45,
        description: 'Preventive vaccination',
      },
      {
        id: '3',
        name: 'Surgery Consultation',
        duration: 45,
        price: 120,
        description: 'Pre-surgical consultation',
      },
      {
        id: '4',
        name: 'Emergency Visit',
        duration: 60,
        price: 200,
        description: 'Urgent medical attention',
      },
    ];
    set({ appointmentTypes: mockTypes });
  },
}));