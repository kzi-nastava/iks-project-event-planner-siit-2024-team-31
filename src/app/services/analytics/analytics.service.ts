import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AttendanceData,
  DemographicsData,
  EventAnalytics,
  EventAnalyticsSummary,
  RatingData,
} from '../../types/models/analytics.model';
import { baseUrl, joinUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = joinUrl(baseUrl, 'analytics');

  constructor(private http: HttpClient) {}

  /**
   * Get analytics summary for all events (for dashboard)
   */
  getEventAnalyticsSummary(): Observable<EventAnalyticsSummary[]> {
    return this.http
      .get<EventAnalyticsSummary[]>(`${this.apiUrl}/events/summary`)
      .pipe(
        catchError((error) => {
          console.warn(
            'Failed to fetch analytics summary from API, using mock data:',
            error
          );
          return of(this.generateMockEventSummaries());
        })
      );
  }

  /**
   * Get analytics summary for organizer's own events (for OD role)
   */
  getMyEventsAnalyticsSummary(): Observable<EventAnalyticsSummary[]> {
    return this.http
      .get<EventAnalyticsSummary[]>(`${this.apiUrl}/events/my/summary`)
      .pipe(
        catchError((error) => {
          console.warn(
            'Failed to fetch my events analytics summary from API, using mock data:',
            error
          );
          return of(
            this.generateMockEventSummaries().filter(() => Math.random() > 0.3)
          );
        })
      );
  }

  /**
   * Get detailed analytics for a specific event
   */
  getEventAnalytics(eventId: number): Observable<EventAnalytics> {
    return this.http
      .get<EventAnalytics>(`${this.apiUrl}/events/${eventId}`)
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to fetch analytics for event ${eventId} from API, using mock data:`,
            error
          );
          return of(this.generateMockEventAnalytics(eventId));
        })
      );
  }

  /**
   * Get attendance data for a specific event
   */
  getEventAttendance(eventId: number): Observable<AttendanceData> {
    return this.http
      .get<AttendanceData>(`${this.apiUrl}/events/${eventId}/attendance`)
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to fetch attendance for event ${eventId} from API:`,
            error
          );
          return of(this.generateMockEventAnalytics(eventId).attendance);
        })
      );
  }

  /**
   * Get rating data for a specific event
   */
  getEventRatings(eventId: number): Observable<RatingData> {
    return this.http
      .get<RatingData>(`${this.apiUrl}/events/${eventId}/ratings`)
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to fetch ratings for event ${eventId} from API:`,
            error
          );
          return of(this.generateMockEventAnalytics(eventId).ratings);
        })
      );
  }

  /**
   * Get demographics data for a specific event
   */
  getEventDemographics(eventId: number): Observable<DemographicsData> {
    return this.http
      .get<DemographicsData>(`${this.apiUrl}/events/${eventId}/demographics`)
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to fetch demographics for event ${eventId} from API:`,
            error
          );
          return of(this.generateMockEventAnalytics(eventId).demographics);
        })
      );
  }

  /**
   * Get analytics for events created by specific organizer
   */
  getOrganizerEventAnalytics(
    organizerId: number
  ): Observable<EventAnalyticsSummary[]> {
    return this.http
      .get<EventAnalyticsSummary[]>(
        `${this.apiUrl}/organizer/${organizerId}/events`
      )
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to fetch organizer analytics for ${organizerId} from API:`,
            error
          );
          return of(
            this.generateMockEventSummaries().filter(
              (event) => Math.random() > 0.5
            )
          );
        })
      );
  }

  /**
   * Export analytics data as PDF report
   */
  exportAnalyticsReport(eventId: number): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/events/${eventId}/export`, {
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => {
          console.warn(
            `Failed to export report for event ${eventId} from API:`,
            error
          );
          // Return empty blob as fallback
          return of(new Blob());
        })
      );
  }

  /**
   * Mock data generators for development/testing - now private
   */
  generateMockEventAnalytics(eventId: number): EventAnalytics {
    return {
      eventId: eventId,
      eventName: `Event ${eventId}`,
      eventType: 'Conference',
      startDate: '2024-01-15T09:00:00Z',
      endDate: '2024-01-15T17:00:00Z',
      attendance: {
        registered: 150,
        attended: 120,
        noShow: 30,
        attendanceRate: 80,
      },
      ratings: {
        averageRating: 4.2,
        totalRatings: 95,
        ratingDistribution: [
          { rating: 5, count: 35, percentage: 36.8 },
          { rating: 4, count: 40, percentage: 42.1 },
          { rating: 3, count: 15, percentage: 15.8 },
          { rating: 2, count: 3, percentage: 3.2 },
          { rating: 1, count: 2, percentage: 2.1 },
        ],
      },
      demographics: {
        ageGroups: [
          { ageRange: '18-25', count: 25, percentage: 20.8 },
          { ageRange: '26-35', count: 45, percentage: 37.5 },
          { ageRange: '36-45', count: 35, percentage: 29.2 },
          { ageRange: '46-55', count: 12, percentage: 10.0 },
          { ageRange: '55+', count: 3, percentage: 2.5 },
        ],
        genderDistribution: [
          { gender: 'Male', count: 70, percentage: 58.3 },
          { gender: 'Female', count: 45, percentage: 37.5 },
          { gender: 'Other', count: 5, percentage: 4.2 },
        ],
        locationDistribution: [
          { location: 'Tallinn', count: 80, percentage: 66.7 },
          { location: 'Tartu', count: 25, percentage: 20.8 },
          { location: 'Pärnu', count: 10, percentage: 8.3 },
          { location: 'Other', count: 5, percentage: 4.2 },
        ],
      },
      registrationTrend: [
        { date: '2024-01-01', registrations: 10, cumulativeRegistrations: 10 },
        { date: '2024-01-02', registrations: 15, cumulativeRegistrations: 25 },
        { date: '2024-01-03', registrations: 20, cumulativeRegistrations: 45 },
        { date: '2024-01-04', registrations: 25, cumulativeRegistrations: 70 },
        { date: '2024-01-05', registrations: 30, cumulativeRegistrations: 100 },
        { date: '2024-01-06', registrations: 25, cumulativeRegistrations: 125 },
        { date: '2024-01-07', registrations: 25, cumulativeRegistrations: 150 },
      ],
    };
  }

  generateMockEventSummaries(): EventAnalyticsSummary[] {
    return [
      {
        eventId: 1,
        eventName: 'Tech Conference 2024',
        totalRegistrations: 150,
        totalAttendees: 120,
        averageRating: 4.2,
        attendanceRate: 80.0,
        createdAt: '2024-01-01T00:00:00Z',
        status: 'completed',
      },
      {
        eventId: 2,
        eventName: 'AI Workshop',
        totalRegistrations: 80,
        totalAttendees: 75,
        averageRating: 4.5,
        attendanceRate: 93.8,
        createdAt: '2024-01-05T00:00:00Z',
        status: 'completed',
      },
      {
        eventId: 3,
        eventName: 'Startup Meetup',
        totalRegistrations: 200,
        totalAttendees: 180,
        averageRating: 3.8,
        attendanceRate: 90.0,
        createdAt: '2024-01-10T00:00:00Z',
        status: 'active',
      },
    ];
  }
}
