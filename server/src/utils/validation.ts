/**
 * Validation schemas using Joi
 */

import Joi from 'joi';

export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    address: Joi.string().max(200).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  update: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
    address: Joi.string().max(200).optional(),
  }),
};

export const petValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required(),
    breed: Joi.string().max(50).optional(),
    age: Joi.number().min(0).max(30).required(),
    weight: Joi.number().min(0).max(200).optional(),
    color: Joi.string().max(30).optional(),
    gender: Joi.string().valid('male', 'female').required(),
    isNeutered: Joi.boolean().required(),
    medicalHistory: Joi.string().max(1000).optional(),
    allergies: Joi.array().items(Joi.string().max(100)).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').optional(),
    breed: Joi.string().max(50).optional(),
    age: Joi.number().min(0).max(30).optional(),
    weight: Joi.number().min(0).max(200).optional(),
    color: Joi.string().max(30).optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    isNeutered: Joi.boolean().optional(),
    medicalHistory: Joi.string().max(1000).optional(),
    allergies: Joi.array().items(Joi.string().max(100)).optional(),
  }),
};

export const appointmentValidation = {
  create: Joi.object({
    petId: Joi.string().uuid().required(),
    vetId: Joi.string().uuid().optional(),
    type: Joi.string().valid('checkup', 'vaccination', 'surgery', 'emergency', 'consultation').required(),
    dateTime: Joi.string().isoDate().required(),
    duration: Joi.number().min(15).max(480).required(),
    reason: Joi.string().min(10).max(500).required(),
    notes: Joi.string().max(1000).optional(),
  }),

  update: Joi.object({
    vetId: Joi.string().uuid().optional(),
    type: Joi.string().valid('checkup', 'vaccination', 'surgery', 'emergency', 'consultation').optional(),
    status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled').optional(),
    dateTime: Joi.string().isoDate().optional(),
    duration: Joi.number().min(15).max(480).optional(),
    reason: Joi.string().min(10).max(500).optional(),
    notes: Joi.string().max(1000).optional(),
    cost: Joi.number().min(0).optional(),
  }),
};

export const prescriptionValidation = {
  create: Joi.object({
    appointmentId: Joi.string().uuid().required(),
    petId: Joi.string().uuid().required(),
    medications: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        frequency: Joi.string().required(),
        duration: Joi.string().required(),
        instructions: Joi.string().optional(),
      })
    ).min(1).required(),
    instructions: Joi.string().max(1000).required(),
    startDate: Joi.string().isoDate().required(),
    endDate: Joi.string().isoDate().optional(),
  }),
};

export const productValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(1000).required(),
    category: Joi.string().valid('food', 'toys', 'accessories', 'health', 'grooming').required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().length(3).default('USD'),
    stockQuantity: Joi.number().min(0).required(),
    brand: Joi.string().max(50).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
  }),
};

export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    category: Joi.string().optional(),
    status: Joi.string().optional(),
    dateFrom: Joi.string().isoDate().optional(),
    dateTo: Joi.string().isoDate().optional(),
  }),
};