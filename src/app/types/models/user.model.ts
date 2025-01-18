export interface User {
  role: string;
  email: string;
  password: string;

  firstName: string;
  lastName: string;

  address: {
    country: string;
    city: string;
    street?: string;
    zipCode?: string;
  };

  phoneNumber: string;

  //for PUP
  description?: string;
}
