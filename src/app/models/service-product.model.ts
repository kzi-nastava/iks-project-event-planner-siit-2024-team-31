export interface ServiceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  isAvailable: boolean;
  imageUrls: string[];
  pupInfo: {
    id: string;
    name: string;
    city: string;
    street: string;
    phone: string;
  };
  rating: number;
  timings: {
    minTimeUsageHours: number;
    maxTimeUsageHours: number;
    bookingDeclineDeadlineHours: number;
  };
  cancellationPolicy: string;
  availableFrom: Date;
  availableTo: Date;
  suitableFor: string[];
}
