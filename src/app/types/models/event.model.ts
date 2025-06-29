import { TempPhotoUrlAndIdDTO } from '../dto/tempPhotoUrlAndIdDTO';
import { EventType } from '../eventType';
import { AgendaItem } from './agendaItem.model';
import { BudgetItem } from './budgetItem.model';

export interface Event {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  maxNumGuests: number;
  isPrivate: boolean;
  eventType: EventType;
  status: string;
  organizer_id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  agenda: AgendaItem[] | null;
  budget: BudgetItem[] | null;
  photos: TempPhotoUrlAndIdDTO[];
}
