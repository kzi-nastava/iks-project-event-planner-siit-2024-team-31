import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CommonMessageResponse } from '../../types/dto/responses/commonMessageResponse';
import { Page } from '../../types/page';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly apiUrl = baseUrl + 'favorites';

  // Reactive state for favorites
  private favoriteEventsSubject = new BehaviorSubject<Set<number>>(new Set());
  private favoriteProductsSubject = new BehaviorSubject<Set<number>>(new Set());
  private favoriteServicesSubject = new BehaviorSubject<Set<number>>(new Set());

  // Public observables
  favoriteEvents$ = this.favoriteEventsSubject.asObservable();
  favoriteProducts$ = this.favoriteProductsSubject.asObservable();
  favoriteServices$ = this.favoriteServicesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Helper methods to manage state
  private addToFavoriteEvents(eventId: number): void {
    const current = this.favoriteEventsSubject.value;
    current.add(eventId);
    this.favoriteEventsSubject.next(new Set(current));
  }

  private removeFromFavoriteEvents(eventId: number): void {
    const current = this.favoriteEventsSubject.value;
    current.delete(eventId);
    this.favoriteEventsSubject.next(new Set(current));
  }

  private addToFavoriteProducts(productId: number): void {
    const current = this.favoriteProductsSubject.value;
    current.add(productId);
    this.favoriteProductsSubject.next(new Set(current));
  }

  private removeFromFavoriteProducts(productId: number): void {
    const current = this.favoriteProductsSubject.value;
    current.delete(productId);
    this.favoriteProductsSubject.next(new Set(current));
  }

  private addToFavoriteServices(serviceId: number): void {
    const current = this.favoriteServicesSubject.value;
    current.add(serviceId);
    this.favoriteServicesSubject.next(new Set(current));
  }

  private removeFromFavoriteServices(serviceId: number): void {
    const current = this.favoriteServicesSubject.value;
    current.delete(serviceId);
    this.favoriteServicesSubject.next(new Set(current));
  }

  // Public methods to check if item is favorite
  isEventFavorite(eventId: number): boolean {
    return this.favoriteEventsSubject.value.has(eventId);
  }

  isProductFavorite(productId: number): boolean {
    return this.favoriteProductsSubject.value.has(productId);
  }

  isServiceFavorite(serviceId: number): boolean {
    return this.favoriteServicesSubject.value.has(serviceId);
  }

  // Load all favorites and update state
  loadAllFavorites(): void {
    // Load favorite events
    this.getFavoriteEvents().subscribe({
      next: (response: Page<any>) => {
        const eventIds = new Set(
          (response.content || []).map((item: any) => item.id)
        );
        this.favoriteEventsSubject.next(eventIds);
      },
      error: (error) => console.error('Error loading favorite events:', error),
    });

    // Load favorite products
    this.getFavoriteProducts().subscribe({
      next: (response: Page<any>) => {
        const productIds = new Set(
          (response.content || []).map((item: any) => item.id)
        );
        this.favoriteProductsSubject.next(productIds);
      },
      error: (error) =>
        console.error('Error loading favorite products:', error),
    });

    // Load favorite services
    this.getFavoriteServices().subscribe({
      next: (response: Page<any>) => {
        const serviceIds = new Set(
          (response.content || []).map((item: any) => item.id)
        );
        this.favoriteServicesSubject.next(serviceIds);
      },
      error: (error) =>
        console.error('Error loading favorite services:', error),
    });
  }

  // Event favorites
  addFavoriteEvent(eventId: number): Observable<CommonMessageResponse> {
    return this.http
      .post<CommonMessageResponse>(`${this.apiUrl}/event/${eventId}`, {})
      .pipe(tap(() => this.addToFavoriteEvents(eventId)));
  }

  removeFavoriteEvent(eventId: number): Observable<CommonMessageResponse> {
    return this.http
      .delete<CommonMessageResponse>(`${this.apiUrl}/event/${eventId}`)
      .pipe(tap(() => this.removeFromFavoriteEvents(eventId)));
  }

  getFavoriteEvents(
    page: number = 0,
    size: number = 10
  ): Observable<Page<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<any>>(`${this.apiUrl}/event/my`, { params });
  }

  // Product favorites
  addFavoriteProduct(productId: number): Observable<CommonMessageResponse> {
    return this.http
      .post<CommonMessageResponse>(`${this.apiUrl}/product/${productId}`, {})
      .pipe(tap(() => this.addToFavoriteProducts(productId)));
  }

  removeFavoriteProduct(productId: number): Observable<CommonMessageResponse> {
    return this.http
      .delete<CommonMessageResponse>(`${this.apiUrl}/product/${productId}`)
      .pipe(tap(() => this.removeFromFavoriteProducts(productId)));
  }

  getFavoriteProducts(
    page: number = 0,
    size: number = 10
  ): Observable<Page<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<any>>(`${this.apiUrl}/product/my`, { params });
  }

  // Service favorites
  addFavoriteService(serviceId: number): Observable<CommonMessageResponse> {
    return this.http
      .post<CommonMessageResponse>(`${this.apiUrl}/service/${serviceId}`, {})
      .pipe(tap(() => this.addToFavoriteServices(serviceId)));
  }

  removeFavoriteService(serviceId: number): Observable<CommonMessageResponse> {
    return this.http
      .delete<CommonMessageResponse>(`${this.apiUrl}/service/${serviceId}`)
      .pipe(tap(() => this.removeFromFavoriteServices(serviceId)));
  }

  getFavoriteServices(
    page: number = 0,
    size: number = 10
  ): Observable<Page<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<any>>(`${this.apiUrl}/service/my`, { params });
  }
}
