/**
 * Pet model interface and data access layer
 * Handles pet data structure and database operations
 */

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  medicalNotes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  medicalNotes?: string;
}

export interface UpdatePetRequest {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'male' | 'female';
  medicalNotes?: string;
}

export interface PetResponse {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  medicalNotes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetDatabase {
  pets: Pet[];
}

/**
 * Pet data access object for JSON file operations
 */
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PetDAO {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '../../data/pets.json');
    this.initializeDatabase();
  }

  /**
   * Initialize database file if it doesn't exist
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      const initialData: PetDatabase = { pets: [] };
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.writeFile(this.dbPath, JSON.stringify(initialData, null, 2));
    }
  }

  /**
   * Read pets data from JSON file
   */
  private async readDatabase(): Promise<PetDatabase> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading pets database:', error);
      return { pets: [] };
    }
  }

  /**
   * Write pets data to JSON file
   */
  private async writeDatabase(data: PetDatabase): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing pets database:', error);
      throw new Error('Failed to save pet data');
    }
  }

  /**
   * Get all pets for a specific user
   */
  async getPetsByUserId(userId: string): Promise<Pet[]> {
    const db = await this.readDatabase();
    return db.pets.filter(pet => pet.userId === userId);
  }

  /**
   * Get a specific pet by ID and user ID
   */
  async getPetById(petId: string, userId: string): Promise<Pet | null> {
    const db = await this.readDatabase();
    return db.pets.find(pet => pet.id === petId && pet.userId === userId) || null;
  }

  /**
   * Create a new pet
   */
  async createPet(userId: string, petData: CreatePetRequest): Promise<Pet> {
    const db = await this.readDatabase();
    
    const newPet: Pet = {
      id: uuidv4(),
      userId,
      ...petData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    db.pets.push(newPet);
    await this.writeDatabase(db);
    
    return newPet;
  }

  /**
   * Update an existing pet
   */
  async updatePet(petId: string, userId: string, updateData: UpdatePetRequest): Promise<Pet | null> {
    const db = await this.readDatabase();
    const petIndex = db.pets.findIndex(pet => pet.id === petId && pet.userId === userId);
    
    if (petIndex === -1) {
      return null;
    }

    db.pets[petIndex] = {
      ...db.pets[petIndex],
      ...updateData,
      updatedAt: new Date()
    };

    await this.writeDatabase(db);
    return db.pets[petIndex];
  }

  /**
   * Update pet image URL
   */
  async updatePetImage(petId: string, userId: string, imageUrl: string): Promise<Pet | null> {
    const db = await this.readDatabase();
    const petIndex = db.pets.findIndex(pet => pet.id === petId && pet.userId === userId);
    
    if (petIndex === -1) {
      return null;
    }

    db.pets[petIndex].imageUrl = imageUrl;
    db.pets[petIndex].updatedAt = new Date();

    await this.writeDatabase(db);
    return db.pets[petIndex];
  }

  /**
   * Delete a pet
   */
  async deletePet(petId: string, userId: string): Promise<boolean> {
    const db = await this.readDatabase();
    const initialLength = db.pets.length;
    
    db.pets = db.pets.filter(pet => !(pet.id === petId && pet.userId === userId));
    
    if (db.pets.length === initialLength) {
      return false;
    }

    await this.writeDatabase(db);
    return true;
  }
}