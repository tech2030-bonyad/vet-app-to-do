export interface SearchableItem {
  id: string;
  type: 'pet' | 'appointment' | 'prescription' | 'product';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet extends SearchableItem {
  type: 'pet';
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: string;
  ownerName: string;
  status: 'active' | 'inactive';
}

export interface Appointment extends SearchableItem {
  type: 'appointment';
  petId: string;
  petName: string;
  veterinarianId: string;
  veterinarianName: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
}

export interface Prescription extends SearchableItem {
  type: 'prescription';
  petId: string;
  petName: string;
  medication: string;
  dosage: string;
  frequency: string;
  veterinarianId: string;
  veterinarianName: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface Product extends SearchableItem {
  type: 'product';
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
}

export interface SearchFilters {
  types: Array<'pet' | 'appointment' | 'prescription' | 'product'>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  species?: string[];
  categories?: string[];
  veterinarians?: string[];
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  results: SearchableItem[];
  isLoading: boolean;
  error: string | null;
  history: string[];
  suggestions: string[];
}

export interface SearchHighlight {
  text: string;
  isHighlighted: boolean;
}