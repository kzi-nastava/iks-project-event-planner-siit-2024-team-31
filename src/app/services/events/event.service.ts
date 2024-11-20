import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Event } from '../../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = '';

  constructor(private http: HttpClient) {}

  private events: Event[] = [
    {
      id: '1',
      title: 'Classical Music Concert',
      description:
        'Immerse yourself in the world of classical music with top performers.',
      date: new Date('2023-11-15'),
      imageUrl: 'assets/images/event1.jpg',
      city: 'New York',
    },
    {
      id: '2',
      title: 'Modern Art Exhibition',
      description: 'Appreciate new works by contemporary artists.',
      date: new Date('2023-11-20'),
      imageUrl: 'assets/images/event2.jpg',
      city: 'New York',
    },
    {
      id: '3',
      title: 'Theatrical Performance',
      description: 'A classic play in a new interpretation.',
      date: new Date('2023-11-25'),
      imageUrl: 'assets/images/event3.jpg',
      city: 'New York',
    },
    {
      id: '4',
      title: 'Business Conference',
      description: 'Discussing current trends in business.',
      date: new Date('2023-12-05'),
      imageUrl: 'assets/images/event4.jpg',
      city: 'New York',
    },
    {
      id: '5',
      title: 'Food Festival',
      description: 'Taste dishes from around the world.',
      date: new Date('2023-12-10'),
      imageUrl: 'assets/images/event5.jpg',
      city: 'New York',
    },
    {
      id: '6',
      title: 'Technology Expo',
      description: 'Explore the latest in technology and innovation.',
      date: new Date('2023-12-15'),
      imageUrl: 'assets/images/event6.jpg',
      city: 'New York',
    },
    {
      id: '7',
      title: 'Marathon',
      description: 'Join runners from around the globe in this annual event.',
      date: new Date('2023-12-20'),
      imageUrl: 'assets/images/event7.jpg',
      city: 'New York',
    },
    {
      id: '8',
      title: 'Film Festival',
      description: 'Screenings of independent and blockbuster films.',
      date: new Date('2023-12-25'),
      imageUrl: 'assets/images/event8.jpg',
      city: 'New York',
    },
    {
      id: '9',
      title: 'Holiday Market',
      description: 'Shop for unique gifts and enjoy festive treats.',
      date: new Date('2023-12-30'),
      imageUrl: 'assets/images/event9.jpg',
      city: 'New York',
    },
    {
      id: '10',
      title: "New Year's Eve Gala",
      description: 'Celebrate the new year in style.',
      date: new Date('2023-12-31'),
      imageUrl: 'assets/images/event10.jpg',
      city: 'New York',
    },
  ];

  getTopEvents(city: string): Observable<Event[]> {
    //return this.http.get<Event[]>(`${this.apiUrl}/top?city=${city}`);

    //test data
    const topEvents = this.events
      .filter((event) => event.city === city)
      .slice(0, 5);
    return of(topEvents);
  }

  getAllEvents(city: string): Observable<Event[]> {
    //return this.http.get<Event[]>(`${this.apiUrl}?city=${city}`);

    //test data
    const events = this.events.filter((event) => event.city === city);
    return of(events);
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
}
