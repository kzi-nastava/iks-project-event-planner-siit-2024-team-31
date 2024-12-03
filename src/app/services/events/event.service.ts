import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Event } from '../../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = '';

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
      title: `Event Title ${index + 1}`,
      type: ['Conference', 'Exhibition', 'Festival', 'Networking', 'Workshop'][
        index % 5
      ],
      description: `This is the description of Event Title ${
        index + 1
      }. It is a ${
        ['Conference', 'Exhibition', 'Festival', 'Networking', 'Workshop'][
          index % 5
        ]
      }.`,
      dateStart: isNaN(dateStart.getTime()) ? new Date() : dateStart,
      dateEnd: isNaN(dateEnd.getTime()) ? new Date() : dateEnd,
      imageUrls: Array.from(
        { length: 3 },
        (_, imgIndex) =>
          `https://picsum.photos/300/200?random=${
            20 + index * 3 + imgIndex + 1
          }`
      ),
      location: {
        city: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Chicago'][
          index % 5
        ],
        street: [
          'Market Street',
          '5th Avenue',
          'Lamar Blvd',
          'Pike Place',
          'Wacker Drive',
        ][index % 5],
        object: [
          'Hall A',
          'Hall B',
          'Main Auditorium',
          'Outdoor Stage',
          'Room 101',
        ][index % 5],
      },
      maxNumberOfGuests: 50 + index * 10,
      isPrivate: index % 2 === 0,
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
    console.log(this.events);
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

  //filtering
  private filtersSource = new BehaviorSubject<any>({});
  filters$ = this.filtersSource.asObservable();

  updateFilters(filters: any) {
    //logic for request server filter
    this.filtersSource.next(filters);
  }
}
