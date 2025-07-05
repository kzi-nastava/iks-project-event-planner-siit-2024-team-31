import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ServiceFilters } from '../../types/filter.interface';
import { Service } from '../../types/models/service.model';
import { PaginatedResponse } from '../../types/pagination.interface';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProvidedServiceService {
  constructor(private http: HttpClient) {}

  private apiUrl = baseUrl + 'service';

  private getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  public getTopServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/public/top-5`);
  }

  public getServicesPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<Service[]> {
    let url = `${this.apiUrl}/public/search?page=${page}&size=${pageSize}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&keyword=${encodeURIComponent(searchTerm.trim())}`;
    }
    return this.http
      .get<PaginatedResponse<Service>>(url)
      .pipe(map((response) => response.content));
  }

  public getServicesPageWithMeta(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResponse<Service>> {
    let url: string;

    if (searchTerm && searchTerm.trim() !== '') {
      // Use search endpoint when we have a search term
      url = `${
        this.apiUrl
      }/public/search?page=${page}&size=${pageSize}&keyword=${encodeURIComponent(
        searchTerm.trim()
      )}`;
    } else {
      // Use search endpoint without search parameter for pagination
      url = `${this.apiUrl}/public/search?page=${page}&size=${pageSize}`;
    }

    return this.http.get<PaginatedResponse<Service>>(url);
  }

  // Advanced filtering method
  public getServicesWithFilters(
    page: number,
    pageSize: number,
    filters: ServiceFilters
  ): Observable<PaginatedResponse<Service>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    // Add filters to params
    if (filters.searchTerm && filters.searchTerm.trim()) {
      params = params.set('keyword', filters.searchTerm.trim());
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // Multiple category IDs
      filters.categoryIds.forEach((categoryId) => {
        params = params.append('categoryIds', categoryId);
      });
    }

    if (filters.minPrice !== undefined && filters.minPrice >= 0) {
      params = params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      params = params.set('minRating', filters.minRating.toString());
    }

    if (filters.availableFrom) {
      params = params.set('availableFrom', filters.availableFrom);
    }

    if (filters.availableTo) {
      params = params.set('availableTo', filters.availableTo);
    }

    if (filters.serviceDurationMinMinutes !== undefined) {
      params = params.append(
        'serviceDurationMinMinutes',
        filters.serviceDurationMinMinutes.toString()
      );
    }

    if (filters.serviceDurationMaxMinutes !== undefined) {
      params = params.append(
        'serviceDurationMaxMinutes',
        filters.serviceDurationMaxMinutes.toString()
      );
    }

    if (filters.suitableFor && filters.suitableFor.length > 0) {
      // Convert string IDs to numbers and add to params
      filters.suitableFor.forEach((suitableId) => {
        const numericId = parseInt(suitableId, 10);
        if (!isNaN(numericId)) {
          params = params.append('suitableFor', numericId.toString());
        }
      });
    }

    if (filters.available !== undefined) {
      params = params.set('available', filters.available.toString());
    }

    if (filters.pupId) {
      // Convert string ID to number
      const numericPupId = parseInt(filters.pupId, 10);
      if (!isNaN(numericPupId)) {
        params = params.set('pupId', numericPupId.toString());
      }
    }

    // Handle sorting with default values
    if (filters.sortBy) {
      const sortBy = filters.sortBy || 'name';
      const sortDirection = filters.sortDirection || 'asc';
      params = params.set('sort', `${sortBy},${sortDirection}`);
    } else {
      // Default sorting
      params = params.set('sort', 'name,asc');
    }

    return this.http.get<PaginatedResponse<Service>>(
      `${this.apiUrl}/public/filter-search`,
      { params }
    );
  }

  public searchServices(
    searchTerm: string,
    page: number = 0,
    pageSize: number = 20
  ): Observable<Service[]> {
    return this.getServicesPage(page, pageSize, searchTerm);
  }

  public getAllServices(): Observable<Service[]> {
    return this.getServicesPage(0, 20);
  }

  public getMyServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
    });
  }

  // New method for paginated my services
  public getMyServicesPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResponse<Service>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('keyword', encodeURIComponent(searchTerm.trim()));
    }

    return this.http.get<PaginatedResponse<Service>>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  public getServiceById(id: string): Observable<Service> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((service: any) => this.mapServerServiceToClient(service)));
  }

  private mapServerServiceToClient(serverService: any): Service {
    return {
      ...serverService,
      available:
        serverService.isAvailable !== undefined
          ? serverService.isAvailable
          : true,
      visible:
        serverService.isVisible !== undefined ? serverService.isVisible : true,
    };
  }

  public createNewService(request: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request, {
      headers: this.getHeaders(),
    });
  }

  public updateService(id: string, request: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request, {
      headers: this.getHeaders(),
    });
  }

  public deleteService(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Get filter options for services
  public getServiceFilterOptions(): Observable<{
    categories: any[];
    suitableForOptions: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
  }> {
    return this.http.get<any>(`${this.apiUrl}/public/filter-options`);
  }
}
