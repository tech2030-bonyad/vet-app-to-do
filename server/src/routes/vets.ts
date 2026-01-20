/**
 * Veterinarian routes for appointment management system
 */

import express, { Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Vet, VetResponse, VetListResponse, CreateVetRequest, UpdateVetRequest } from '../models/Vet';
import { Appointment } from '../models/Appointment';
import { authenticateToken } from '../middleware/auth';
import { getAvailableTimeSlots } from '../utils/timeSlots';

const router = express.Router();
const VETS_FILE = path.join(__dirname, '../../data/vets.json');
const APPOINTMENTS_FILE = path.join(__dirname, '../../data/appointments.json');

/**
 * Load vets from JSON file
 */
async function loadVets(): Promise<Vet[]> {
  try {
    const data = await fs.readFile(VETS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading vets:', error);
    return [];
  }
}

/**
 * Save vets to JSON file
 */
async function saveVets(vets: Vet[]): Promise<void> {
  try {
    await fs.writeFile(VETS_FILE, JSON.stringify(vets, null, 2));
  } catch (error) {
    console.error('Error saving vets:', error);
    throw new Error('Failed to save vets data');
  }
}

/**
 * Load appointments from JSON file
 */
async function loadAppointments(): Promise<Appointment[]> {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading appointments:', error);
    return [];
  }
}

/**
 * Transform Vet to VetResponse
 */
function transformVetToResponse(vet: Vet): VetResponse {
  return {
    id: vet.id,
    name: vet.name,
    specialization: vet.specialization,
    experience: vet.experience,
    rating: vet.rating,
    availability: vet.availability,
    isActive: vet.isActive
  };
}

/**
 * GET /api/vets
 * Get list of available veterinarians
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('specialization').optional().isString().withMessage('Specialization must be a string'),
  query('active').optional().isBoolean().withMessage('Active must be a boolean')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const specialization = req.query.specialization as string;
    const activeOnly = req.query.active === 'true';

    const vets = await loadVets();
    
    // Filter vets
    let filteredVets = vets;
    
    if (activeOnly) {
      filteredVets = filteredVets.filter(vet => vet.isActive);
    }
    
    if (specialization) {
      filteredVets = filteredVets.filter(vet => 
        vet.specialization.some(spec => 
          spec.toLowerCase().includes(specialization.toLowerCase())
        )
      );
    }

    // Sort by rating (highest first)
    filteredVets.sort((a, b) => b.rating - a.rating);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVets = filteredVets.slice(startIndex, endIndex);

    const response: VetListResponse = {
      vets: paginatedVets.map(transformVetToResponse),
      total: filteredVets.length,
      page,
      limit
    };

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching vets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/vets/:id
 * Get specific veterinarian details
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid vet ID format')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const vets = await loadVets();
    const vet = vets.find(v => v.id === id);

    if (!vet) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    res.json({
      success: true,
      data: transformVetToResponse(vet)
    });
  } catch (error) {
    console.error('Error fetching vet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/vets/:id/availability
 * Get available time slots for a specific vet on a specific date
 */
router.get('/:id/availability', [
  param('id').isUUID().withMessage('Invalid vet ID format'),
  query('date').isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  query('appointmentType').isIn(['checkup', 'vaccination', 'emergency', 'surgery', 'dental', 'grooming', 'consultation'])
    .withMessage('Invalid appointment type')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { date, appointmentType } = req.query;

    const vets = await loadVets();
    const vet = vets.find(v => v.id === id);

    if (!vet) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    const appointments = await loadAppointments();
    const availableSlots = getAvailableTimeSlots(
      vet,
      date as string,
      appointments,
      appointmentType as any
    );

    res.json({
      success: true,
      data: {
        vetId: id,
        date,
        appointmentType,
        availableSlots
      }
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/vets
 * Create a new veterinarian (Admin only)
 */
router.post('/', authenticateToken, [
  body('name').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  body('specialization').isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('licenseNumber').isLength({ min: 5, max: 20 }).withMessage('License number must be between 5 and 20 characters'),
  body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('availability').isObject().withMessage('Availability must be an object')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vetData: CreateVetRequest = req.body;
    const vets = await loadVets();

    // Check if email already exists
    const existingVet = vets.find(vet => vet.email === vetData.email);
    if (existingVet) {
      return res.status(409).json({
        success: false,
        message: 'Veterinarian with this email already exists'
      });
    }

    const newVet: Vet = {
      id: uuidv4(),
      ...vetData,
      rating: 5.0, // Default rating
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    vets.push(newVet);
    await saveVets(vets);

    res.status(201).json({
      success: true,
      message: 'Veterinarian created successfully',
      data: transformVetToResponse(newVet)
    });
  } catch (error) {
    console.error('Error creating vet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/vets/:id
 * Update veterinarian information (Admin only)
 */
router.put('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid vet ID format'),
  body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  body('specialization').optional().isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('experience').optional().isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData: UpdateVetRequest = req.body;
    const vets = await loadVets();
    
    const vetIndex = vets.findIndex(vet => vet.id === id);
    if (vetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Check if email already exists (if updating email)
    if (updateData.email) {
      const existingVet = vets.find(vet => vet.email === updateData.email && vet.id !== id);
      if (existingVet) {
        return res.status(409).json({
          success: false,
          message: 'Veterinarian with this email already exists'
        });
      }
    }

    const updatedVet: Vet = {
      ...vets[vetIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    vets[vetIndex] = updatedVet;
    await saveVets(vets);

    res.json({
      success: true,
      message: 'Veterinarian updated successfully',
      data: transformVetToResponse(updatedVet)
    });
  } catch (error) {
    console.error('Error updating vet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/vets/:id
 * Deactivate veterinarian (Admin only)
 */
router.delete('/:id', authenticateToken, [
  param('id').isUUID().withMessage('Invalid vet ID format')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const vets = await loadVets();
    
    const vetIndex = vets.findIndex(vet => vet.id === id);
    if (vetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    // Deactivate instead of deleting
    vets[vetIndex].isActive = false;
    vets[vetIndex].updatedAt = new Date().toISOString();
    
    await saveVets(vets);

    res.json({
      success: true,
      message: 'Veterinarian deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating vet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;