import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateEventRequest } from '../../types/dto/requests/createEventRequest';
import { CreateEventResponse } from '../../types/dto/responses/createEventResponse';
import { EventType } from '../../types/eventType';
import { EventFilters } from '../../types/filter.interface';
import { Event } from '../../types/models/event.model';
import { Page } from '../../types/page';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = baseUrl + 'event';

  constructor(private http: HttpClient) {}

  // Public methods for event retrieval
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/public/${id}`);
  }

  searchEvents(
    keyword?: string,
    page: number = 0,
    pageSize: number = 20
  ): Observable<Page<Event>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http.get<Page<Event>>(`${this.apiUrl}/public/search`, {
      params,
    });
  }

  getTopEvents(): Observable<Event[]> {
    return this.http
      .get<Page<Event>>(`${this.apiUrl}/public/top-5`)
      .pipe(map((page) => page.content));
  }

  getAllEvents(): Observable<Event[]> {
    // Use search without keyword to get all events
    return this.searchEvents('', 0, 1000).pipe(map((page) => page.content));
  }

  // Advanced filtering method
  filterEvents(
    filters: EventFilters,
    page: number = 0,
    pageSize: number = 20
  ): Observable<Page<Event>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    // Add filter parameters
    if (filters.searchTerm && filters.searchTerm.trim()) {
      params = params.set('keyword', filters.searchTerm.trim());
    }

    if (filters.eventTypeIds && filters.eventTypeIds.length > 0) {
      // Convert string array to number array for API
      const typeIds = filters.eventTypeIds.map((id) => parseInt(id, 10));
      typeIds.forEach((id) => {
        params = params.append('eventTypeIds', id.toString());
      });
    }

    if (filters.city && filters.city.trim()) {
      params = params.set('city', filters.city.trim());
    }

    if (filters.fromDate) {
      // Convert to LocalDateTime format expected by backend
      const fromDateTime = new Date(filters.fromDate).toISOString();
      params = params.set('dateAfter', fromDateTime);
    }

    if (filters.toDate) {
      // Convert to LocalDateTime format expected by backend
      const toDateTime = new Date(filters.toDate);
      toDateTime.setHours(23, 59, 59, 999); // End of day
      params = params.set('dateBefore', toDateTime.toISOString());
    }

    if (filters.minGuests !== undefined && filters.minGuests > 0) {
      params = params.set('minGuestNum', filters.minGuests.toString());
    }

    if (filters.maxGuests !== undefined && filters.maxGuests > 0) {
      params = params.set('maxGuestNum', filters.maxGuests.toString());
    }

    return this.http.get<Page<Event>>(`${this.apiUrl}/public/filter-search`, {
      params,
    });
  }

  // Get filter options (price ranges, etc.)
  getEventFilterOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/filter-options`);
  }

  // Pagination method for compatibility
  getEventsPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<Event[]> {
    return this.searchEvents(searchTerm, page, pageSize).pipe(
      map((pageResult) => pageResult.content)
    );
  }

  // Event creation (requires authentication)
  createEvent(
    eventRequest: CreateEventRequest
  ): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.apiUrl}`, eventRequest);
  }

  // Event creation with FormData (requires authentication)
  createEventWithFormData(formData: FormData): Observable<CreateEventResponse> {
    return this.http.post<CreateEventResponse>(`${this.apiUrl}`, formData);
  }

  // Update event (requires authentication)
  updateEvent(eventId: string, eventData: Event): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${eventId}`, eventData);
  }

  // Send invite (requires authentication)
  sendInvite(eventId: string, email: string): Observable<any> {
    const params = new HttpParams().set('email', email);

    return this.http.post<any>(
      `${this.apiUrl}/${eventId}/send-invite`,
      {},
      { params }
    );
  }

  // Legacy filter management (kept for compatibility)
  private filtersSource = new BehaviorSubject<EventFilters>({});
  filters$ = this.filtersSource.asObservable();

  updateFilters(filters: EventFilters) {
    this.filtersSource.next(filters);
  }

  public getEventTypes(): Observable<EventType[]> {
    return this.http.get<EventType[]>(`${this.apiUrl}/event-types`);
  }

  // Get my events for organizer (requires OD role)
  getMyEvents(
    page: number = 0,
    pageSize: number = 20
  ): Observable<Page<Event>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    return this.http.get<Page<Event>>(`${this.apiUrl}/my-events/organizer`, {
      params,
    });
  }

  // Get user events by month for calendar (requires authentication)
  getEventsByMonth(year: number, month: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/calendar/${year}/${month}`);
  }
}
