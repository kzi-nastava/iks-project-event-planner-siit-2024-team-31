import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventTypesService {

  constructor() { }

  private baseApiUrl = 'http://localhost:3308/event-types/';

  // public getEventTypes(): Observable<EventTypes[]> {
  // }

}
