export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  description: string;
  imageUri?: string;
  medicalNotes?: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'male' | 'female';
  description: string;
  medicalNotes?: string;
  isVaccinated: boolean;
  isNeutered: boolean;
}