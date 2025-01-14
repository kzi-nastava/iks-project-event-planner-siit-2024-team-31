export interface CreateServiceRequest {
  token: string | null;
  name: string;
  category: string;
  description: string;
  peculiarities: string;
  price: number;
  discount: number;
  photos: string[];
  suitableEventTypes: number[]; //ids of event types
  isVisible: boolean;
  isAvailable: boolean;
  serviceDurationMin: number;
  serviceDurationMax: number;
  bookingDeclineDeadline: number;
  noTimeSelectionRequired: boolean;
  manualTimeSelection: boolean;
  bookingConfirmation: 'Manual' | 'Auto';
}
