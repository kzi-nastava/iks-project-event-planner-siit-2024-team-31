import { ProductCategory } from '../productCategory';

export interface EventTypeFullDTO {
  id: number;
  name: string;
  description: string;
  status: {
    id: number;
    version: number;
    name: string;
    description: string;
  };
  recommendedProductCategories: ProductCategory[];
}
