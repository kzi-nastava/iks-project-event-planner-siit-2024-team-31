import { TempPhotoUrlAndIdDTO } from '../dto/tempPhotoUrlAndIdDTO';
import { EventType } from '../eventType';
import { ServiceCategory } from '../serviceCategory';
import { Status } from '../status';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  category: ServiceCategory;
  available: boolean;
  photos: TempPhotoUrlAndIdDTO[];
  pupId: string;
  rating: number;
  serviceDurationMinMinutes: number;
  serviceDurationMaxMinutes: number;
  bookingDeclineDeadlineHours: number;
  cancellationPolicy: string;
  availableFrom?: Date | string;
  availableTo?: Date | string;
  suitableEventTypes: EventType[];
  categoryId: string;
  categoryName: string;
  pupUsername: string;
  peculiarities?: string;
  status: Status;
  visible: boolean;
}
