/**
 * Medical record model and interface definitions
 * Handles medical history and visit tracking
 */

export interface IMedicalRecord {
  id: string;
  petId: string;
  vetId: string;
  visitDate: Date;
  visitType: VisitType;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  prescriptions: string[]; // Array of prescription IDs
  attachments: string[]; // Array of file paths/URLs
  followUpRequired: boolean;
  followUpDate?: Date;
  vitals?: IVitals;
  createdAt: Date;
  updatedAt: Date;
}

export enum VisitType {
  ROUTINE_CHECKUP = 'routine_checkup',
  EMERGENCY = 'emergency',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  FOLLOW_UP = 'follow_up',
  DENTAL = 'dental',
  GROOMING = 'grooming',
  OTHER = 'other'
}

export interface IVitals {
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  bloodPressure?: string;
  notes?: string;
}

export interface IMedicalRecordCreate {
  petId: string;
  vetId: string;
  visitType: VisitType;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  vitals?: IVitals;
}

export interface IMedicalRecordUpdate {
  visitType?: VisitType;
  chiefComplaint?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  vitals?: IVitals;
}

export interface IMedicalTimeline {
  petId: string;
  records: IMedicalRecord[];
  totalRecords: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
}

export class MedicalRecord implements IMedicalRecord {
  id: string;
  petId: string;
  vetId: string;
  visitDate: Date;
  visitType: VisitType;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  prescriptions: string[];
  attachments: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  vitals?: IVitals;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IMedicalRecordCreate) {
    this.id = this.generateId();
    this.petId = data.petId;
    this.vetId = data.vetId;
    this.visitDate = new Date();
    this.visitType = data.visitType;
    this.chiefComplaint = data.chiefComplaint;
    this.diagnosis = data.diagnosis;
    this.treatment = data.treatment;
    this.notes = data.notes;
    this.prescriptions = [];
    this.attachments = [];
    this.followUpRequired = data.followUpRequired;
    this.followUpDate = data.followUpDate;
    this.vitals = data.vitals;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public addPrescription(prescriptionId: string): void {
    if (!this.prescriptions.includes(prescriptionId)) {
      this.prescriptions.push(prescriptionId);
      this.updatedAt = new Date();
    }
  }

  public addAttachment(filePath: string): void {
    if (!this.attachments.includes(filePath)) {
      this.attachments.push(filePath);
      this.updatedAt = new Date();
    }
  }

  public update(data: IMedicalRecordUpdate): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}