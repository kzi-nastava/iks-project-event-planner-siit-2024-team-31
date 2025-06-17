import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { EventType } from '../../types/eventType';
import { Event } from '../../types/models/event.model';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = baseUrl + 'event';

  constructor(private http: HttpClient) {}

  private events: Event[] = Array.from({ length: 50 }, (_, index) => {
    const dateStart = new Date(
      `2024-12-${((index % 30) + 1).toString().padStart(2, '0')}T10:00:00`
    );
    const dateEnd = new Date(
      `2024-12-${((index % 30) + 1).toString().padStart(2, '0')}T12:00:00`
    );

    return {
      id: `event-${index + 1}`,
      name: `Event Title ${index + 1}`,
      eventType: {
        id: index % 5,
        name: [
          'Conference',
          'Exhibition',
          'Festival',
          'Networking',
          'Workshop',
        ][index % 5],
      },
      description: `This is the description of Event Title ${
        index + 1
      }. It is a ${
        ['Conference', 'Exhibition', 'Festival', 'Networking', 'Workshop'][
          index % 5
        ]
      }.`,
      startDate: isNaN(dateStart.getTime())
        ? new Date().toISOString()
        : dateStart.toISOString(),
      endDate: isNaN(dateEnd.getTime())
        ? new Date().toISOString()
        : dateEnd.toISOString(),
      imageUrls: Array.from(
        { length: 3 },
        (_, imgIndex) =>
          `https://picsum.photos/300/200?random=${
            20 + index * 3 + imgIndex + 1
          }`
      ),
      location: {
        lng: 19.8227 + index * 0.01,
        lat: 45.2396 + index * 0.01,
        address: `Address ${index + 1}`,
      },
      maxNumGuests: 50 + index * 10,
      isPrivate: index % 2 === 0,
      agenda: null,
      budget: null,
    };
  });

  getTopEvents(): Observable<Event[]> {
    //return this.http.get<Event[]>(`${this.apiUrl}/top?city=${city}`);

    //test data
    const topEvents = this.events.slice(0, 5);
    return of(topEvents);
  }

  getAllEvents(): Observable<Event[]> {
    //return this.http.get<Event[]>(`${this.apiUrl}?city=${city}`);
    //test data
    return of(this.events);
  }

  getEventById(id: string): Observable<Event> {
    //return this.http.get<Event>(`${this.apiUrl}/${id}`);

    //test data
    const event = this.events.find((event) => event.id === id);
    if (event) {
      return of(event);
    } else {
      return throwError(() => new Error('Event not found'));
    }
  }

  public getEventTypes(): Observable<EventType[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<EventType[]>(`${this.apiUrl}/event-types`, {
      headers,
    });
  }

  //filtering
  private filtersSource = new BehaviorSubject<any>({});
  filters$ = this.filtersSource.asObservable();

  updateFilters(filters: any) {
    //logic for request server filter
    this.filtersSource.next(filters);
  }

  getEventsPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<Event[]> {
    // For now using mock data, but this should be:
    // let url = `${this.apiUrl}/public/search?page=${page}&pageSize=${pageSize}`;
    // if (searchTerm && searchTerm.trim()) {
    //   url += `&search=${encodeURIComponent(searchTerm.trim())}`;
    // }
    // return this.http.get<Event[]>(url);

    // Mock implementation with search and pagination
    let filteredEvents = this.events;
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredEvents = this.events.filter(
        (event) =>
          event.name.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term)
      );
    }

    const startIndex = page * pageSize;
    const paginatedEvents = filteredEvents.slice(
      startIndex,
      startIndex + pageSize
    );
    return of(paginatedEvents);
  }

  searchEvents(
    searchTerm: string,
    page: number = 0,
    pageSize: number = 20
  ): Observable<Event[]> {
    return this.getEventsPage(page, pageSize, searchTerm);
  }
}
