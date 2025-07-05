import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductFilters } from '../../types/filter.interface';
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

  // Advanced filtering method
  public getProductsWithFilters(
    page: number,
    pageSize: number,
    filters: ProductFilters
  ): Observable<PaginatedResponse<Product>> {
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

    if (filters.suitableFor && filters.suitableFor.length > 0) {
      filters.suitableFor.forEach((suitable) => {
        params = params.append('suitableFor', suitable);
      });
    }

    if (filters.available !== undefined) {
      params = params.set('available', filters.available.toString());
    }

    if (filters.pupId) {
      params = params.set('pupId', filters.pupId);
    }

    if (filters.sortBy) {
      const sortBy = filters.sortBy || 'name';
      const sortDirection = filters.sortDirection || 'asc';
      params = params.set('sort', `${sortBy},${sortDirection}`);
    } else {
      // Default sorting
      params = params.set('sort', 'name,asc');
    }

    return this.http.get<PaginatedResponse<Product>>(
      `${this.apiUrl}/public/filter-search`,
      { params }
    );
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
    return this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((product: any) => this.mapServerProductToClient(product)));
  }

  private mapServerProductToClient(serverProduct: any): Product {
    return {
      ...serverProduct,
      available:
        serverProduct.isAvailable !== undefined
          ? serverProduct.isAvailable
          : true,
      visible:
        serverProduct.isVisible !== undefined ? serverProduct.isVisible : true,
    };
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
    });
  }

  // New method for paginated my products
  getMyProductsPage(
    page: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('keyword', encodeURIComponent(searchTerm.trim()));
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  // Get filter options for products
  public getProductFilterOptions(): Observable<{
    categories: any[];
    suitableForOptions: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
  }> {
    return this.http.get<any>(`${this.apiUrl}/public/filter-options`);
  }

  // Update product
  public updateProduct(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      headers: this.getHeaders(),
    });
  }

  // Delete product
  public deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
