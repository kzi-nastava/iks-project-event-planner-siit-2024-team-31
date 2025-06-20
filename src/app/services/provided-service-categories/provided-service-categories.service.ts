import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../types/page';
import { ServiceCategory } from '../../types/serviceCategory';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProvidedServiceCategoriesService {
  constructor(private http: HttpClient) {}

  baseApiUrl = baseUrl + 'service-category';

  private getHeaders() {
    return {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
  }

  // Public method for getting categories without authentication
  searchServiceCategoriesPublic(
    keyword: string,
    page: number,
    size: number
  ): Observable<Page<ServiceCategory>> {
    const params = {
      keyword,
      page: (page - 1).toString(),
      size: size.toString(),
    };
    return this.http.get<Page<ServiceCategory>>(
      `${this.baseApiUrl}/public/search`,
      {
        params,
      }
    );
  }

  // Public method for getting all categories without authentication
  getAllServiceCategoriesPublic(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.baseApiUrl}/public/all`);
  }

  // Protected method for authenticated users
  searchServiceCategories(
    keyword: string,
    page: number,
    size: number
  ): Observable<Page<ServiceCategory>> {
    const params = {
      keyword,
      page: (page - 1).toString(),
      size: size.toString(),
    };
    return this.http.get<Page<ServiceCategory>>(
      `${this.baseApiUrl}/public/search`,
      {
        params,
        headers: this.getHeaders(),
      }
    );
  }

  // Protected method for authenticated users
  getAllServiceCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(`${this.baseApiUrl}/all`, {
      headers: this.getHeaders(),
    });
  }
}
