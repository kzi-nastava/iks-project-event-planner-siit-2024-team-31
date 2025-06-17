import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../../types/models/product.model';
import { PaginatedResponse } from '../../types/pagination.interface';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = baseUrl + 'product';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  public createNewProduct(request: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, request, {
      headers: this.getHeaders(),
    });
  }

  getTopProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/public/top-5`);
  }

  public getProductsPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<Product[]> {
    let url = `${this.apiUrl}/public/search?page=${page}&size=${pageSize}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&keyword=${encodeURIComponent(searchTerm.trim())}`;
    }
    return this.http
      .get<PaginatedResponse<Product>>(url)
      .pipe(map((response) => response.content));
  }

  public getProductsPageWithMeta(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResponse<Product>> {
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

    return this.http.get<PaginatedResponse<Product>>(url);
  }

  public searchProducts(
    searchTerm: string,
    page: number = 0,
    pageSize: number = 20
  ): Observable<Product[]> {
    return this.getProductsPage(page, pageSize, searchTerm);
  }

  getAllProducts(): Observable<Product[]> {
    return this.getProductsPage(0, 20);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/public/${id}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
    });
  }
}
