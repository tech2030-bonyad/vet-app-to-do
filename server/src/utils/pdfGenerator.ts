/**
 * PDF generation utility for prescriptions and medical records
 * Uses PDFKit for generating professional medical documents
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IPrescription } from '../models/Prescription';
import { IMedicalRecord } from '../models/MedicalRecord';

export interface IPDFGenerationOptions {
  outputPath?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  clinicInfo?: IClinicInfo;
}

export interface IClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  license?: string;
}

export class PDFGenerator {
  private static readonly DEFAULT_CLINIC_INFO: IClinicInfo = {
    name: 'VetCare Clinic',
    address: '123 Pet Street, Animal City, AC 12345',
    phone: '(555) 123-4567',
    email: 'info@vetcare.com',
    license: 'VET-LIC-12345'
  };

  /**
   * Generate prescription PDF
   * @param prescription - Prescription data
   * @param petInfo - Pet information
   * @param vetInfo - Veterinarian information
   * @param options - PDF generation options
   * @returns Promise<string> - Path to generated PDF
   */
  public static async generatePrescriptionPDF(
    prescription: IPrescription,
    petInfo: any,
    vetInfo: any,
    options: IPDFGenerationOptions = {}
  ): Promise<string> {
    const doc = new PDFDocument({ margin: 50 });
    const outputPath = options.outputPath || 
      path.join(process.cwd(), 'temp', `prescription_${prescription.id}.pdf`);

    // Ensure temp directory exists
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    try {
      // Header
      if (options.includeHeader !== false) {
        this.addHeader(doc, options.clinicInfo || this.DEFAULT_CLINIC_INFO);
      }

      // Title
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('PRESCRIPTION', 50, 150, { align: 'center' });

      // Prescription details
      let yPosition = 200;

      // Prescription ID and Date
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Prescription ID:', 50, yPosition)
         .font('Helvetica')
         .text(prescription.id, 150, yPosition);

      doc.font('Helvetica-Bold')
         .text('Date:', 350, yPosition)
         .font('Helvetica')
         .text(prescription.prescriptionDate.toLocaleDateString(), 400, yPosition);

      yPosition += 30;

      // Pet Information
      doc.font('Helvetica-Bold')
         .text('PATIENT INFORMATION', 50, yPosition);
      yPosition += 20;

      doc.font('Helvetica')
         .text(`Pet Name: ${petInfo.name}`, 50, yPosition)
         .text(`Species: ${petInfo.species}`, 300, yPosition);
      yPosition += 15;

      doc.text(`Breed: ${petInfo.breed}`, 50, yPosition)
         .text(`Age: ${petInfo.age}`, 300, yPosition);
      yPosition += 15;

      doc.text(`Weight: ${petInfo.weight} kg`, 50, yPosition)
         .text(`Owner: ${petInfo.ownerName}`, 300, yPosition);

      yPosition += 40;

      // Veterinarian Information
      doc.font('Helvetica-Bold')
         .text('PRESCRIBING VETERINARIAN', 50, yPosition);
      yPosition += 20;

      doc.font('Helvetica')
         .text(`Dr. ${vetInfo.name}`, 50, yPosition)
         .text(`License: ${vetInfo.license}`, 300, yPosition);

      yPosition += 40;

      // Prescription Details
      doc.font('Helvetica-Bold')
         .text('PRESCRIPTION DETAILS', 50, yPosition);
      yPosition += 20;

      // Medication box
      doc.rect(50, yPosition, 500, 150)
         .stroke();

      yPosition += 15;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`Medication: ${prescription.medicationName}`, 60, yPosition);
      yPosition += 25;

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Dosage: ${prescription.dosage}`, 60, yPosition)
         .text(`Quantity: ${prescription.quantity}`, 300, yPosition);
      yPosition += 20;

      doc.text(`Frequency: ${prescription.frequency}`, 60, yPosition)
         .text(`Duration: ${prescription.duration}`, 300, yPosition);
      yPosition += 20;

      doc.text(`Refills Allowed: ${prescription.refillsAllowed}`, 60, yPosition)
         .text(`Refills Used: ${prescription.refillsUsed}`, 300, yPosition);
      yPosition += 30;

      // Instructions
      doc.font('Helvetica-Bold')
         .text('Instructions:', 60, yPosition);
      yPosition += 15;

      doc.font('Helvetica')
         .text(prescription.instructions, 60, yPosition, { width: 480 });

      yPosition += 60;

      // Notes if available
      if (prescription.notes) {
        doc.font('Helvetica-Bold')
           .text('Additional Notes:', 50, yPosition);
        yPosition += 15;

        doc.font('Helvetica')
           .text(prescription.notes, 50, yPosition, { width: 500 });
        yPosition += 30;
      }

      // Expiry date
      doc.font('Helvetica-Bold')
         .text(`Expires: ${prescription.expiryDate.toLocaleDateString()}`, 50, yPosition);

      // Footer
      if (options.includeFooter !== false) {
        this.addFooter(doc);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });

    } catch (error) {
      doc.end();
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Generate medical record PDF
   * @param record - Medical record data
   * @param petInfo - Pet information
   * @param vetInfo - Veterinarian information
   * @param options - PDF generation options
   * @returns Promise<string> - Path to generated PDF
   */
  public static async generateMedicalRecordPDF(
    record: IMedicalRecord,
    petInfo: any,
    vetInfo: any,
    options: IPDFGenerationOptions = {}
  ): Promise<string> {
    const doc = new PDFDocument({ margin: 50 });
    const outputPath = options.outputPath || 
      path.join(process.cwd(), 'temp', `medical_record_${record.id}.pdf`);

    // Ensure temp directory exists
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    try {
      // Header
      if (options.includeHeader !== false) {
        this.addHeader(doc, options.clinicInfo || this.DEFAULT_CLINIC_INFO);
      }

      // Title
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('MEDICAL RECORD', 50, 150, { align: 'center' });

      let yPosition = 200;

      // Record details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Record ID:', 50, yPosition)
         .font('Helvetica')
         .text(record.id, 150, yPosition);

      doc.font('Helvetica-Bold')
         .text('Visit Date:', 350, yPosition)
         .font('Helvetica')
         .text(record.visitDate.toLocaleDateString(), 420, yPosition);

      yPosition += 30;

      // Pet Information
      doc.font('Helvetica-Bold')
         .text('PATIENT INFORMATION', 50, yPosition);
      yPosition += 20;

      doc.font('Helvetica')
         .text(`Pet Name: ${petInfo.name}`, 50, yPosition)
         .text(`Species: ${petInfo.species}`, 300, yPosition);
      yPosition += 15;

      doc.text(`Breed: ${petInfo.breed}`, 50, yPosition)
         .text(`Visit Type: ${record.visitType}`, 300, yPosition);

      yPosition += 40;

      // Vitals if available
      if (record.vitals) {
        doc.font('Helvetica-Bold')
           .text('VITAL SIGNS', 50, yPosition);
        yPosition += 20;

        doc.font('Helvetica')
           .text(`Weight: ${record.vitals.weight} kg`, 50, yPosition)
           .text(`Temperature: ${record.vitals.temperature}°C`, 200, yPosition)
           .text(`Heart Rate: ${record.vitals.heartRate} bpm`, 350, yPosition);
        yPosition += 15;

        doc.text(`Respiratory Rate: ${record.vitals.respiratoryRate} rpm`, 50, yPosition);
        if (record.vitals.bloodPressure) {
          doc.text(`Blood Pressure: ${record.vitals.bloodPressure}`, 250, yPosition);
        }
        yPosition += 30;
      }

      // Medical details
      doc.font('Helvetica-Bold')
         .text('CHIEF COMPLAINT', 50, yPosition);
      yPosition += 15;
      doc.font('Helvetica')
         .text(record.chiefComplaint, 50, yPosition, { width: 500 });
      yPosition += 30;

      doc.font('Helvetica-Bold')
         .text('DIAGNOSIS', 50, yPosition);
      yPosition += 15;
      doc.font('Helvetica')
         .text(record.diagnosis, 50, yPosition, { width: 500 });
      yPosition += 30;

      doc.font('Helvetica-Bold')
         .text('TREATMENT', 50, yPosition);
      yPosition += 15;
      doc.font('Helvetica')
         .text(record.treatment, 50, yPosition, { width: 500 });
      yPosition += 30;

      // Notes if available
      if (record.notes) {
        doc.font('Helvetica-Bold')
           .text('NOTES', 50, yPosition);
        yPosition += 15;
        doc.font('Helvetica')
           .text(record.notes, 50, yPosition, { width: 500 });
        yPosition += 30;
      }

      // Follow-up information
      if (record.followUpRequired) {
        doc.font('Helvetica-Bold')
           .text('FOLLOW-UP REQUIRED', 50, yPosition);
        if (record.followUpDate) {
          doc.font('Helvetica')
             .text(`Follow-up Date: ${record.followUpDate.toLocaleDateString()}`, 50, yPosition + 15);
        }
      }

      // Footer
      if (options.includeFooter !== false) {
        this.addFooter(doc);
      }

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });

    } catch (error) {
      doc.end();
      throw new Error(`PDF generation failed: ${error}`);
    }
  }

  /**
   * Add header to PDF document
   */
  private static addHeader(doc: PDFKit.PDFDocument, clinicInfo: IClinicInfo): void {
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(clinicInfo.name, 50, 50);

    doc.fontSize(10)
       .font('Helvetica')
       .text(clinicInfo.address, 50, 70)
       .text(`Phone: ${clinicInfo.phone} | Email: ${clinicInfo.email}`, 50, 85);

    if (clinicInfo.license) {
      doc.text(`License: ${clinicInfo.license}`, 50, 100);
    }

    // Add line separator
    doc.moveTo(50, 130)
       .lineTo(550, 130)
       .stroke();
  }

  /**
   * Add footer to PDF document
   */
  private static addFooter(doc: PDFKit.PDFDocument): void {
    const bottomMargin = 50;
    const pageHeight = doc.page.height;

    doc.fontSize(8)
       .font('Helvetica')
       .text(
         'This prescription/record is confidential and intended only for the named patient.',
         50,
         pageHeight - bottomMargin - 20,
         { align: 'center', width: 500 }
       );

    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      50,
      pageHeight - bottomMargin,
      { align: 'center', width: 500 }
    );
  }

  /**
   * Clean up temporary PDF files
   */
  public static cleanupTempFiles(maxAge: number = 24 * 60 * 60 * 1000): void {
    const tempDir = path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
      return;
    }

    const files = fs.readdirSync(tempDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  }
}