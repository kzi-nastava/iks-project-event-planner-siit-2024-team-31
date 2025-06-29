export interface CreateEventResponse {
  success: boolean;
  message: string;
  eventId?: string;
  data?: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  };
}
