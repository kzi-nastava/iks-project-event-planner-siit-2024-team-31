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
  minTimeUsageHours: number;
  maxTimeUsageHours: number;
  bookingDeclineDeadlineHours: number;
  cancellationPolicy: string;
  availableFrom: Date;
  availableTo: Date;
  suitableFor: string[];
}
