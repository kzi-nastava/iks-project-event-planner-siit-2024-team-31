import { ProductCategory } from '../productCategory'

export interface Product {
  id: string;
  pupId: string;
  name: string;
  description: string;
  peculiarities: string;
  price: number;
  category: ProductCategory;
  isAvailable: boolean;
  imageUrls: string[];
  rating: number;
  suitableFor: string[];
}
