import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * Pet management state with Zustand
 * Handles pet profiles, selection, and pet-related data
 */

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  color: string;
  microchipId?: string;
  avatar?: string;
  medicalHistory: MedicalRecord[];
  vaccinations: Vaccination[];
  allergies: string[];
  medications: Medication[];
  emergencyContact?: EmergencyContact;
  veterinarian?: Veterinarian;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'checkup' | 'surgery' | 'emergency' | 'vaccination' | 'treatment';
  description: string;
  veterinarian: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments: string[];
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDueDate: string;
  veterinarian: string;
  batchNumber?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
  isActive: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Veterinarian {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  email: string;
  address: string;
}

export interface PetState {
  // State
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterSpecies: string | null;

  // Actions
  addPet: (petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePet: (petId: string, updates: Partial<Pet>) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  selectPet: (pet: Pet | null) => void;
  getPetById: (petId: string) => Pet | undefined;
  addMedicalRecord: (petId: string, record: Omit<MedicalRecord, 'id'>) => Promise<void>;
  addVaccination: (petId: string, vaccination: Omit<Vaccination, 'id'>) => Promise<void>;
  addMedication: (petId: string, medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (petId: string, medicationId: string, updates: Partial<Medication>) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilterSpecies: (species: string | null) => void;
  clearError: () => void;
  loadPets: () => Promise<void>;
}

// Mock API functions
const petAPI = {
  async fetchPets(): Promise<Pet[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data or empty array
    return [];
  },

  async createPet(petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPet: Pet = {
      ...petData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newPet;
  },

  async updatePet(petId: string, updates: Partial<Pet>): Promise<Pet> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return updated pet (mock)
    return {
      id: petId,
      name: 'Updated Pet',
      species: 'dog',
      breed: 'Mixed',
      age: 3,
      weight: 25,
      gender: 'male',
      color: 'Brown',
      medicalHistory: [],
      vaccinations: [],
      allergies: [],
      medications: [],
      notes: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  },

  async deletePet(petId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      // Initial state
      pets: [],
      selectedPet: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      filterSpecies: null,

      // Actions
      addPet: async (petData) => {
        try {
          set({ isLoading: true, error: null });
          
          const newPet = await petAPI.createPet(petData);
          
          set(state => ({
            pets: [...state.pets, newPet],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add pet',
            isLoading: false,
          });
          throw error;
        }
      },

      updatePet: async (petId, updates) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedPet = await petAPI.updatePet(petId, updates);
          
          set(state => ({
            pets: state.pets.map(pet => 
              pet.id === petId ? updatedPet : pet
            ),
            selectedPet: state.selectedPet?.id === petId ? updatedPet : state.selectedPet,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update pet',
            isLoading: false,
          });
          throw error;
        }
      },

      deletePet: async (petId) => {
        try {
          set({ isLoading: true, error: null });
          
          await petAPI.deletePet(petId);
          
          set(state => ({
            pets: state.pets.filter(pet => pet.id !== petId),
            selectedPet: state.selectedPet?.id === petId ? null : state.selectedPet,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete pet',
            isLoading: false,
          });
          throw error;
        }
      },

      selectPet: (pet) => {
        set({ selectedPet: pet });
      },

      getPetById: (petId) => {
        return get().pets.find(pet => pet.id === petId);
      },

      addMedicalRecord: async (petId, record) => {
        try {
          const newRecord: MedicalRecord = {
            ...record,
            id: Date.now().toString(),
          };

          set(state => ({
            pets: state.pets.map(pet =>
              pet.id === petId
                ? { ...pet, medicalHistory: [...pet.medicalHistory, newRecord] }
                : pet
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add medical record',
          });
          throw error;
        }
      },

      addVaccination: async (petId, vaccination) => {
        try {
          const newVaccination: Vaccination = {
            ...vaccination,
            id: Date.now().toString(),
          };

          set(state => ({
            pets: state.pets.map(pet =>
              pet.id === petId
                ? { ...pet, vaccinations: [...pet.vaccinations, newVaccination] }
                : pet
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add vaccination',
          });
          throw error;
        }
      },

      addMedication: async (petId, medication) => {
        try {
          const newMedication: Medication = {
            ...medication,
            id: Date.now().toString(),
          };

          set(state => ({
            pets: state.pets.map(pet =>
              pet.id === petId
                ? { ...pet, medications: [...pet.medications, newMedication] }
                : pet
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add medication',
          });
          throw error;
        }
      },

      updateMedication: async (petId, medicationId, updates) => {
        try {
          set(state => ({
            pets: state.pets.map(pet =>
              pet.id === petId
                ? {
                    ...pet,
                    medications: pet.medications.map(med =>
                      med.id === medicationId ? { ...med, ...updates } : med
                    ),
                  }
                : pet
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update medication',
          });
          throw error;
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterSpecies: (species) => {
        set({ filterSpecies: species });
      },

      clearError: () => {
        set({ error: null });
      },

      loadPets: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const pets = await petAPI.fetchPets();
          
          set({
            pets,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load pets',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.PET_STATE,
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await storage.getItem(name);
          return value ? JSON.stringify(value) : null;
        },
        setItem: async (name: string, value: string) => {
          await storage.setItem(name, JSON.parse(value));
        },
        removeItem: async (name: string) => {
          await storage.removeItem(name);
        },
      })),
      // Persist all pet data except loading states
      partialize: (state) => ({
        pets: state.pets,
        selectedPet: state.selectedPet,
      }),
    }
  )
);