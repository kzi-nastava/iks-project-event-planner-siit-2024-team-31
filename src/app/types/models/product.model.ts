export interface Product {
  id: string;
  pupId: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  isAvailable: boolean;
  imageUrls: string[];
  rating: number;
  suitableFor: string[];
}
