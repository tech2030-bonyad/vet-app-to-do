/**
 * Prescription model and interface definitions
 * Handles prescription data structure and validation
 */

export interface IPrescription {
  id: string;
  petId: string;
  vetId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  prescriptionDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PrescriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IPrescriptionCreate {
  petId: string;
  vetId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refillsAllowed: number;
  notes?: string;
}

export interface IPrescriptionUpdate {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  quantity?: number;
  refillsAllowed?: number;
  status?: PrescriptionStatus;
  notes?: string;
}

export class Prescription implements IPrescription {
  id: string;
  petId: string;
  vetId: string;
  appointmentId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  refillsAllowed: number;
  refillsUsed: number;
  prescriptionDate: Date;
  expiryDate: Date;
  status: PrescriptionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IPrescriptionCreate) {
    this.id = this.generateId();
    this.petId = data.petId;
    this.vetId = data.vetId;
    this.appointmentId = data.appointmentId;
    this.medicationName = data.medicationName;
    this.dosage = data.dosage;
    this.frequency = data.frequency;
    this.duration = data.duration;
    this.instructions = data.instructions;
    this.quantity = data.quantity;
    this.refillsAllowed = data.refillsAllowed;
    this.refillsUsed = 0;
    this.prescriptionDate = new Date();
    this.expiryDate = this.calculateExpiryDate();
    this.status = PrescriptionStatus.ACTIVE;
    this.notes = data.notes;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default 1 year expiry
    return expiryDate;
  }

  public isExpired(): boolean {
    return new Date() > this.expiryDate;
  }

  public canRefill(): boolean {
    return this.refillsUsed < this.refillsAllowed && 
           this.status === PrescriptionStatus.ACTIVE && 
           !this.isExpired();
  }

  public processRefill(): boolean {
    if (this.canRefill()) {
      this.refillsUsed++;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  public update(data: IPrescriptionUpdate): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}