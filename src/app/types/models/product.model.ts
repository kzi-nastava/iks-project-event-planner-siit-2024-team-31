import { TempPhotoUrlAndIdDTO } from '../dto/tempPhotoUrlAndIdDTO';
import { EventType } from '../eventType';
import { ProductCategory } from '../productCategory';
import { Status } from '../status';

export interface Product {
  id: string;
  pupId: string;
  name: string;
  description: string;
  peculiarities: string;
  price: number;
  discount: number;
  category: ProductCategory;
  available: boolean;
  photos: TempPhotoUrlAndIdDTO[];
  rating: number;
  suitableEventTypes: EventType[];
  status: Status;
  visible: boolean;
}
