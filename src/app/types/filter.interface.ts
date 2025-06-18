export interface ServiceFilters {
  searchTerm?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availableFrom?: string;
  availableTo?: string;
  serviceDurationMinMinutes?: number;
  serviceDurationMaxMinutes?: number;
  suitableFor?: string[];
  isAvailable?: boolean;
  pupId?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'availableFrom';
  sortDirection?: 'asc' | 'desc';
}

export interface ProductFilters {
  searchTerm?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  suitableFor?: string[];
  isAvailable?: boolean;
  pupId?: string;
  sortBy?: 'name' | 'price' | 'rating';
  sortDirection?: 'asc' | 'desc';
}

export interface FilterOption {
  id: string;
  name: string;
  count?: number; // For showing how many items match this filter
}

export interface FilterState {
  services: ServiceFilters;
  products: ProductFilters;
  currentType: 'services' | 'products';
}
