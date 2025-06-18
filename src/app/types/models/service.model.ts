import { ServiceCategory } from '../serviceCategory';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  isAvailable: boolean;
  imageUrls: string[];
  pupId: string;
  rating: number;
  serviceDurationMinMinutes: number;
  serviceDurationMaxMinutes: number;
  bookingDeclineDeadlineHours: number;
  cancellationPolicy: string;
  availableFrom?: Date | string;
  availableTo?: Date | string;
  suitableFor: string[];
  categoryId: string;
  categoryName: string;
  pupUsername: string;
  suitableForEventTypes: string[];
}
