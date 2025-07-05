import { Status } from './status';

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  status: Status;
}
