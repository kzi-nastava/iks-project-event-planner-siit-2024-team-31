export interface User {
  id?: number;
  role: string; // ('OD', 'PUP', 'AK')
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  address?: string;
  phoneNumber?: string;
  // (PUP)
  companyName?: string;
  companyDescription?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyPhotos?: string[];
  token?: string;
}
