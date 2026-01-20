/**
 * Validation utilities for pet management
 * Provides comprehensive input validation and sanitization
 */

import { CreatePetRequest, UpdatePetRequest } from '../models/Pet';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate pet creation request
 */
export function validateCreatePetRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required and must be a string' });
  } else if (data.name.trim().length < 1 || data.name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Name must be between 1 and 50 characters' });
  }

  // Species validation
  if (!data.species || typeof data.species !== 'string') {
    errors.push({ field: 'species', message: 'Species is required and must be a string' });
  } else if (data.species.trim().length < 1 || data.species.trim().length > 30) {
    errors.push({ field: 'species', message: 'Species must be between 1 and 30 characters' });
  }

  // Breed validation
  if (!data.breed || typeof data.breed !== 'string') {
    errors.push({ field: 'breed', message: 'Breed is required and must be a string' });
  } else if (data.breed.trim().length < 1 || data.breed.trim().length > 50) {
    errors.push({ field: 'breed', message: 'Breed must be between 1 and 50 characters' });
  }

  // Age validation
  if (data.age === undefined || data.age === null) {
    errors.push({ field: 'age', message: 'Age is required' });
  } else if (typeof data.age !== 'number' || !Number.isInteger(data.age)) {
    errors.push({ field: 'age', message: 'Age must be a valid integer' });
  } else if (data.age < 0 || data.age > 50) {
    errors.push({ field: 'age', message: 'Age must be between 0 and 50 years' });
  }

  // Weight validation
  if (data.weight === undefined || data.weight === null) {
    errors.push({ field: 'weight', message: 'Weight is required' });
  } else if (typeof data.weight !== 'number' || data.weight <= 0) {
    errors.push({ field: 'weight', message: 'Weight must be a positive number' });
  } else if (data.weight > 1000) {
    errors.push({ field: 'weight', message: 'Weight must be less than 1000 kg' });
  }

  // Gender validation
  if (!data.gender || typeof data.gender !== 'string') {
    errors.push({ field: 'gender', message: 'Gender is required and must be a string' });
  } else if (!['male', 'female'].includes(data.gender.toLowerCase())) {
    errors.push({ field: 'gender', message: 'Gender must be either "male" or "female"' });
  }

  // Medical notes validation (optional)
  if (data.medicalNotes !== undefined && data.medicalNotes !== null) {
    if (typeof data.medicalNotes !== 'string') {
      errors.push({ field: 'medicalNotes', message: 'Medical notes must be a string' });
    } else if (data.medicalNotes.length > 1000) {
      errors.push({ field: 'medicalNotes', message: 'Medical notes must be less than 1000 characters' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate pet update request
 */
export function validateUpdatePetRequest(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Name validation (optional)
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' });
    } else if (data.name.trim().length < 1 || data.name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name must be between 1 and 50 characters' });
    }
  }

  // Species validation (optional)
  if (data.species !== undefined) {
    if (typeof data.species !== 'string') {
      errors.push({ field: 'species', message: 'Species must be a string' });
    } else if (data.species.trim().length < 1 || data.species.trim().length > 30) {
      errors.push({ field: 'species', message: 'Species must be between 1 and 30 characters' });
    }
  }

  // Breed validation (optional)
  if (data.breed !== undefined) {
    if (typeof data.breed !== 'string') {
      errors.push({ field: 'breed', message: 'Breed must be a string' });
    } else if (data.breed.trim().length < 1 || data.breed.trim().length > 50) {
      errors.push({ field: 'breed', message: 'Breed must be between 1 and 50 characters' });
    }
  }

  // Age validation (optional)
  if (data.age !== undefined) {
    if (typeof data.age !== 'number' || !Number.isInteger(data.age)) {
      errors.push({ field: 'age', message: 'Age must be a valid integer' });
    } else if (data.age < 0 || data.age > 50) {
      errors.push({ field: 'age', message: 'Age must be between 0 and 50 years' });
    }
  }

  // Weight validation (optional)
  if (data.weight !== undefined) {
    if (typeof data.weight !== 'number' || data.weight <= 0) {
      errors.push({ field: 'weight', message: 'Weight must be a positive number' });
    } else if (data.weight > 1000) {
      errors.push({ field: 'weight', message: 'Weight must be less than 1000 kg' });
    }
  }

  // Gender validation (optional)
  if (data.gender !== undefined) {
    if (typeof data.gender !== 'string') {
      errors.push({ field: 'gender', message: 'Gender must be a string' });
    } else if (!['male', 'female'].includes(data.gender.toLowerCase())) {
      errors.push({ field: 'gender', message: 'Gender must be either "male" or "female"' });
    }
  }

  // Medical notes validation (optional)
  if (data.medicalNotes !== undefined && data.medicalNotes !== null) {
    if (typeof data.medicalNotes !== 'string') {
      errors.push({ field: 'medicalNotes', message: 'Medical notes must be a string' });
    } else if (data.medicalNotes.length > 1000) {
      errors.push({ field: 'medicalNotes', message: 'Medical notes must be less than 1000 characters' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize pet data by trimming strings and normalizing values
 */
export function sanitizePetData(data: CreatePetRequest | UpdatePetRequest): CreatePetRequest | UpdatePetRequest {
  const sanitized = { ...data };

  if (sanitized.name) {
    sanitized.name = sanitized.name.trim();
  }
  
  if (sanitized.species) {
    sanitized.species = sanitized.species.trim().toLowerCase();
  }
  
  if (sanitized.breed) {
    sanitized.breed = sanitized.breed.trim();
  }
  
  if (sanitized.gender) {
    sanitized.gender = sanitized.gender.toLowerCase() as 'male' | 'female';
  }
  
  if (sanitized.medicalNotes) {
    sanitized.medicalNotes = sanitized.medicalNotes.trim();
  }

  return sanitized;
}

/**
 * Validate file upload for pet images
 */
export function validateImageFile(file: Express.Multer.File): ValidationResult {
  const errors: ValidationError[] = [];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push({
      field: 'image',
      message: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed'
    });
  }

  if (file.size > maxSize) {
    errors.push({
      field: 'image',
      message: 'File size too large. Maximum size is 5MB'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}