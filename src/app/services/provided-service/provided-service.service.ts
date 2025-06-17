import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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

  public getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/public/${id}`);
  }

  public createNewService(request: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request, {
      headers: this.getHeaders(),
    });
  }
}
