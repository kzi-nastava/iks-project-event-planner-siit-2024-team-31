export interface CreateEventRequest {
  name: string;
  description: string;
  maxNumGuests: number;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  eventTypeName: string; // Изменено с eventTypeId на eventTypeName
  location: {
    id?: number;
    version?: number;
    lat: number;
    lng: number;
    address: string;
  } | null;
  budgetItems?: any[]; // Пока any[], структуру уточним позже
  photos?: string[]; // Пока массив строк, потом заменим на File[]
  agendaItems?: {
    startDate: string;
    endDate: string;
    title: string;
    description: string;
    location: string;
  }[];
  private: boolean; // Обратите внимание: 'private', а не 'isPrivate'
}
