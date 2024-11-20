import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ServiceProduct } from '../../models/service-product.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceProductService {
  private apiUrl = '';

  constructor(private http: HttpClient) {}

  private services: ServiceProduct[] = [
    {
      id: '1',
      title: 'Catering Service',
      description: 'Professional catering for events of any scale.',
      price: 5000,
      imageUrl: 'assets/images/service1.jpg',
      city: 'New York',
    },
    {
      id: '2',
      title: 'Photographer',
      description: 'Capture the best moments of your event.',
      price: 2000,
      imageUrl: 'assets/images/service2.jpg',
      city: 'New York',
    },
    {
      id: '3',
      title: 'Live Band',
      description: 'Live music for any occasion.',
      price: 7000,
      imageUrl: 'assets/images/service3.jpg',
      city: 'New York',
    },
    {
      id: '4',
      title: 'Decorator',
      description: 'Venue and event decoration services.',
      price: 3000,
      imageUrl: 'assets/images/service4.jpg',
      city: 'New York',
    },
    {
      id: '5',
      title: 'Event Host',
      description: 'Professional host for your celebration.',
      price: 2500,
      imageUrl: 'assets/images/service5.jpg',
      city: 'New York',
    },
    {
      id: '6',
      title: 'Security Service',
      description: 'Ensure safety and security at your event.',
      price: 4000,
      imageUrl: 'assets/images/service6.jpg',
      city: 'New York',
    },
    {
      id: '7',
      title: 'DJ Services',
      description: 'Professional DJ to keep the party going.',
      price: 3500,
      imageUrl: 'assets/images/service7.jpg',
      city: 'New York',
    },
    {
      id: '8',
      title: 'Lighting and Sound',
      description: 'High-quality lighting and sound equipment.',
      price: 6000,
      imageUrl: 'assets/images/service8.jpg',
      city: 'New York',
    },
    {
      id: '9',
      title: 'Transportation',
      description: 'Luxury transportation for your guests.',
      price: 8000,
      imageUrl: 'assets/images/service9.jpg',
      city: 'New York',
    },
    {
      id: '10',
      title: 'Florist',
      description: 'Beautiful floral arrangements for your event.',
      price: 1500,
      imageUrl: 'assets/images/service10.jpg',
      city: 'New York',
    },
  ];

  getTopServices(city: string): Observable<ServiceProduct[]> {
    //return this.http.get<ServiceProduct[]>(`${this.apiUrl}/top?city=${city}`);

    const topServices = this.services
      .filter((service) => service.city === city)
      .slice(0, 5);
    return of(topServices);
  }

  getAllServices(city: string): Observable<ServiceProduct[]> {
    //return this.http.get<ServiceProduct[]>(`${this.apiUrl}?city=${city}`);

    const services = this.services.filter((service) => service.city === city);
    return of(services);
  }

  getServiceById(id: string): Observable<ServiceProduct> {
    //return this.http.get<ServiceProduct>(`${this.apiUrl}/${id}`);

    const service = this.services.find((service) => service.id === id);
    if (service) {
      return of(service);
    } else {
      return throwError(() => new Error('Service/Product not found'));
    }
  }
}
