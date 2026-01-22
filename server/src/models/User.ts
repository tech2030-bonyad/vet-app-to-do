/**
 * User model for handling user data operations
 * Uses JSON file as database storage
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserModel {
  private readonly dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '../../data/users.json');
    this.initializeDatabase();
  }

  /**
   * Initialize the database file if it doesn't exist
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await fs.access(this.dbPath);
    } catch {
      // File doesn't exist, create it
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(this.dbPath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Read all users from the database
   */
  private async readUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data) as User[];
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  /**
   * Write users to the database
   */
  private async writeUsers(users: User[]): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error writing users:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const users = await this.readUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    await this.writeUsers(users);
    
    return newUser;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.email === email) || null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.id === id) || null;
  }

  /**
   * Update user by ID
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<User | null> {
    const users = await this.readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== users[userIndex].email) {
      const existingUser = users.find(user => user.email === updateData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    await this.writeUsers(users);
    return users[userIndex];
  }

  /**
   * Convert User to UserResponse (remove password)
   */
  toUserResponse(user: User): UserResponse {
    const { password, ...userResponse } = user;
    return userResponse;
  }
}

export default new UserModel();