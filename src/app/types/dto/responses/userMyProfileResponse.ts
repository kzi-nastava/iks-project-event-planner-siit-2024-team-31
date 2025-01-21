export interface UserMyProfileResponse {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  zipCode: string;
  address: string;
  description: string;
  tempPhotoUrlAndIdDTOList: {
    photoId: number;
    tempPhotoUrl: string;
  }[];
  error: string;
  message: string;
}
