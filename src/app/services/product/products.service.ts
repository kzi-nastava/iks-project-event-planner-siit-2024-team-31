import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Product } from '../../types/models/product.model';
import { ProductCategory } from '../../types/productCategory';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = baseUrl + 'product';

  constructor(private http: HttpClient) {}

  private products: Product[] = Array.from({ length: 50 }, (_, index) => {
    return {
      id: `product-${index + 1}`,
      pupId: `pup-${index + 1}`,
      name: `Product ${index + 1}`,
      description: `This is a detailed description of Product ${
        index + 1
      }. It is designed to provide exceptional value to customers.`,
      price: 50 + index * 10,
      categories: [
        'Photography',
        'Catering',
        'Decoration',
        'Entertainment',
        'Logistics',
      ].slice(0, (index % 5) + 1),
      isAvailable: index % 3 !== 0,
      imageUrls: Array.from(
        { length: 3 },
        (_, imgIndex) =>
          `https://picsum.photos/300/200?random=${
            20 + index * 3 + imgIndex + 1
          }`
      ),
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      suitableFor: ['Wedding', 'Conference', 'Party', 'Concert'].slice(
        0,
        (index % 4) + 1
      ),
    };
  });

  public createNewProduct(request: FormData): Observable<any> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.post(`${this.apiUrl}`, request, { headers });
  }

  public getProductCategories(): Observable<ProductCategory[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<ProductCategory[]>(`${this.apiUrl}/categories`, {
      headers,
    });
  }

  getTopProducts(): Observable<Product[]> {
    const topProducts = this.products.slice(0, 5);
    return of(topProducts);
  }

  getAllProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: string): Observable<Product> {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return of(product);
    } else {
      return throwError(() => new Error('Product not found'));
    }
  }

  getMyProducts(): Observable<Product[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Product[]>(`${this.apiUrl}/my`, { headers });
  }

  getServiceById(id: string): Observable<Product> {
    const product = this.products.find((product) => product.id === id);
    if (product) {
      return of(product);
    } else {
      return throwError(() => new Error('Service not found'));
    }
  }
}
