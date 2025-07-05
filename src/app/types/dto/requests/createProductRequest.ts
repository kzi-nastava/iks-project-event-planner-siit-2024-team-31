export interface CreateProductRequest {
  name: string;
  category: string;
  description: string;
  peculiarities: string;
  price: number;
  discount: number;
  photos: File[];
  suitableEventTypes: number[]; // ids of event types
  visible: boolean;
  available: boolean;
}
