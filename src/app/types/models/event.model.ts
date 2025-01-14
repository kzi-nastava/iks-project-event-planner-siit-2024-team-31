export interface Event {
  id: string;
  title: string;
  type: string;
  description: string;
  dateStart: Date;
  dateEnd: Date;
  imageUrls: string[];
  location: {
    city: string;
    street: string;
    object: string;
  };
  maxNumberOfGuests: number;
  isPrivate: boolean;
}
