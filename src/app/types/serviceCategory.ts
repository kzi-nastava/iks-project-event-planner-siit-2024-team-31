export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  status: {
    id: number;
    version: number;
    name: string;
    description: string;
  };
}
