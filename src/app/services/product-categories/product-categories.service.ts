import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategoryDTO } from '../../types/dto/productCategoryDTO';
import { Page } from '../../types/page';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoriesService {
  constructor(private http: HttpClient) {}

  baseApiUrl = baseUrl + 'product-category';

  private getHeaders() {
    return {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
  }

  // Public method for getting categories without authentication
  searchProductCategoriesPublic(
    keyword: string,
    page: number,
    size: number
  ): Observable<Page<ProductCategoryDTO>> {
    const params = {
      keyword,
      page: (page - 1).toString(),
      size: size.toString(),
    };
    return this.http.get<Page<ProductCategoryDTO>>(
      `${this.baseApiUrl}/public/search`,
      {
        params,
      }
    );
  }

  // Public method for getting all categories without authentication
  getAllProductCategoriesPublic(): Observable<ProductCategoryDTO[]> {
    return this.http.get<ProductCategoryDTO[]>(`${this.baseApiUrl}/public/all`);
  }

  // Protected method for authenticated users
  searchProductCategories(
    keyword: string,
    page: number,
    size: number
  ): Observable<Page<ProductCategoryDTO>> {
    const params = {
      keyword,
      page: (page - 1).toString(),
      size: size.toString(),
    };
    return this.http.get<Page<ProductCategoryDTO>>(
      `${this.baseApiUrl}/search`,
      {
        params,
        headers: this.getHeaders(),
      }
    );
  }
}
