export interface UpdateUserDataRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  zipCode: string;
  address: string;
  description: string;
  deletedPhotosIds: number[];
}
