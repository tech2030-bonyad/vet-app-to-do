/**
 * Simple JSON file-based database utility
 * Provides CRUD operations for mock data storage
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class JsonDatabase<T extends { id: string }> {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(__dirname, '../../data', fileName);
  }

  /**
   * Read all records from the JSON file
   */
  async findAll(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.writeData([]);
        return [];
      }
      throw error;
    }
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | null> {
    const records = await this.findAll();
    return records.find(record => record.id === id) || null;
  }

  /**
   * Find records by a specific field
   */
  async findBy(field: keyof T, value: any): Promise<T[]> {
    const records = await this.findAll();
    return records.filter(record => record[field] === value);
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const records = await this.findAll();
    const newRecord = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    records.push(newRecord);
    await this.writeData(records);
    return newRecord;
  }

  /**
   * Update a record by ID
   */
  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const records = await this.findAll();
    const index = records.findIndex(record => record.id === id);

    if (index === -1) {
      return null;
    }

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.writeData(records);
    return records[index];
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    const records = await this.findAll();
    const filteredRecords = records.filter(record => record.id !== id);

    if (filteredRecords.length === records.length) {
      return false; // Record not found
    }

    await this.writeData(filteredRecords);
    return true;
  }

  /**
   * Write data to the JSON file
   */
  private async writeData(data: T[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Search records with pagination
   */
  async search(
    query: string,
    searchFields: (keyof T)[],
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const records = await this.findAll();
    
    const filteredRecords = query
      ? records.filter(record =>
          searchFields.some(field =>
            String(record[field]).toLowerCase().includes(query.toLowerCase())
          )
        )
      : records;

    const total = filteredRecords.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = filteredRecords.slice(startIndex, startIndex + limit);

    return { data, total, page, totalPages };
  }
}