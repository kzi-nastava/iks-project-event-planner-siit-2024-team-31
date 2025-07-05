import { Status } from './status';

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  status: Status;
}
