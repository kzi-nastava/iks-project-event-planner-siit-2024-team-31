import { EventType } from '../eventType';
import { AgendaItem } from './agendaItem.model';
import { BudgetItem } from './budgetItem.model';

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxNumGuests: number;
  isPrivate: boolean;
  eventType: EventType;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  agenda: AgendaItem[] | null;
  budget: BudgetItem[] | null;
  imageUrls: string[];
}
