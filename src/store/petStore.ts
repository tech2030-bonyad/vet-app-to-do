import { create } from 'zustand';
import { Pet, PetFormData } from '../types/pet';

interface PetStore {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  addPet: (petData: PetFormData, imageUri?: string) => Promise<void>;
  updatePet: (id: string, petData: PetFormData, imageUri?: string) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPetById: (id: string) => Pet | undefined;
  clearError: () => void;
}

export const usePetStore = create<PetStore>((set, get) => ({
  pets: [],
  isLoading: false,
  error: null,

  addPet: async (petData: PetFormData, imageUri?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPet: Pet = {
        id: Date.now().toString(),
        ...petData,
        imageUri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set(state => ({
        pets: [...state.pets, newPet],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add pet', isLoading: false });
    }
  },

  updatePet: async (id: string, petData: PetFormData, imageUri?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        pets: state.pets.map(pet =>
          pet.id === id
            ? {
                ...pet,
                ...petData,
                imageUri: imageUri || pet.imageUri,
                updatedAt: new Date().toISOString(),
              }
            : pet
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update pet', isLoading: false });
    }
  },

  deletePet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        pets: state.pets.filter(pet => pet.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete pet', isLoading: false });
    }
  },

  getPetById: (id: string) => {
    return get().pets.find(pet => pet.id === id);
  },

  clearError: () => set({ error: null }),
}));