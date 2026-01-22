/**
 * Time slot utility functions for appointment scheduling
 */

import { Appointment, AppointmentType, AppointmentStatus } from '../models/Appointment';
import { Vet, TimeSlot } from '../models/Vet';

/**
 * Default duration for different appointment types (in minutes)
 */
export const APPOINTMENT_DURATIONS: Record<AppointmentType, number> = {
  [AppointmentType.CHECKUP]: 30,
  [AppointmentType.VACCINATION]: 15,
  [AppointmentType.EMERGENCY]: 60,
  [AppointmentType.SURGERY]: 120,
  [AppointmentType.DENTAL]: 45,
  [AppointmentType.GROOMING]: 60,
  [AppointmentType.CONSULTATION]: 30
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Add minutes to a time string
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const totalMinutes = timeToMinutes(time) + minutes;
  return minutesToTime(totalMinutes);
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

/**
 * Get day of week from date string (YYYY-MM-DD)
 */
export function getDayOfWeek(date: string): keyof Vet['availability'] {
  const dayNames: (keyof Vet['availability'])[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const dateObj = new Date(date);
  return dayNames[dateObj.getDay()];
}

/**
 * Check if a vet is available at a specific time slot
 */
export function isVetAvailable(
  vet: Vet,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  if (!vet.isActive) return false;

  const dayOfWeek = getDayOfWeek(date);
  const dayAvailability = vet.availability[dayOfWeek];

  return dayAvailability.some(slot => {
    if (!slot.isAvailable) return false;
    
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    const appointmentStart = timeToMinutes(startTime);
    const appointmentEnd = timeToMinutes(endTime);

    return appointmentStart >= slotStart && appointmentEnd <= slotEnd;
  });
}

/**
 * Check for appointment conflicts
 */
export function hasAppointmentConflict(
  existingAppointments: Appointment[],
  vetId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Appointment | null {
  const activeStatuses = [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS
  ];

  const conflictingAppointment = existingAppointments.find(appointment => {
    if (appointment.id === excludeAppointmentId) return false;
    if (appointment.vetId !== vetId) return false;
    if (appointment.date !== date) return false;
    if (!activeStatuses.includes(appointment.status)) return false;

    return timeRangesOverlap(
      appointment.startTime,
      appointment.endTime,
      startTime,
      endTime
    );
  });

  return conflictingAppointment || null;
}

/**
 * Generate available time slots for a vet on a specific date
 */
export function getAvailableTimeSlots(
  vet: Vet,
  date: string,
  existingAppointments: Appointment[],
  appointmentType: AppointmentType,
  slotInterval: number = 15 // minutes
): string[] {
  if (!vet.isActive) return [];

  const dayOfWeek = getDayOfWeek(date);
  const dayAvailability = vet.availability[dayOfWeek];
  const duration = APPOINTMENT_DURATIONS[appointmentType];
  const availableSlots: string[] = [];

  const activeStatuses = [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS
  ];

  const dayAppointments = existingAppointments.filter(appointment =>
    appointment.vetId === vet.id &&
    appointment.date === date &&
    activeStatuses.includes(appointment.status)
  );

  dayAvailability.forEach(slot => {
    if (!slot.isAvailable) return;

    const slotStartMinutes = timeToMinutes(slot.startTime);
    const slotEndMinutes = timeToMinutes(slot.endTime);

    for (let currentMinutes = slotStartMinutes; 
         currentMinutes + duration <= slotEndMinutes; 
         currentMinutes += slotInterval) {
      
      const startTime = minutesToTime(currentMinutes);
      const endTime = minutesToTime(currentMinutes + duration);

      // Check if this time slot conflicts with existing appointments
      const hasConflict = dayAppointments.some(appointment =>
        timeRangesOverlap(appointment.startTime, appointment.endTime, startTime, endTime)
      );

      if (!hasConflict) {
        availableSlots.push(startTime);
      }
    }
  });

  return availableSlots.sort();
}

/**
 * Validate appointment time format
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0] === date;
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDate = new Date(date);
  return appointmentDate >= today;
}

/**
 * Check if appointment time is in the future (for today's appointments)
 */
export function isFutureTime(date: string, time: string): boolean {
  const now = new Date();
  const appointmentDateTime = new Date(`${date}T${time}:00`);
  return appointmentDateTime > now;
}