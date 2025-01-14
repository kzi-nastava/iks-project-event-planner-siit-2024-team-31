import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CreateServiceRequest } from '../../types/dto/requests/createServiceRequest';
import { ServiceProduct } from '../../types/models/service-product.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceProductService {
  private apiUrl = '';

  constructor(private http: HttpClient) {}

  private services: ServiceProduct[] = Array.from(
    { length: 50 },
    (_, index) => {
      const availableFrom = new Date();
      const availableTo = new Date();
      availableTo.setDate(availableTo.getDate() + (index % 30));

      return {
        id: `service-${index + 1}`,
        name: `Service Product ${index + 1}`,
        description: `This is a detailed description of Service Product ${
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
        pupInfo: {
          id: `pup-${index + 1}`,
          name: `PUP Location ${index + 1}`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][
            index % 5
          ],
          street: `${(index + 1) * 10} Main Street`,
          phone: `+1-555-00${index + 10}`,
        },
        rating: parseFloat((Math.random() * 5).toFixed(1)),
        timings: {
          minTimeUsageHours: 2 + (index % 3),
          maxTimeUsageHours: 8 + (index % 5),
          bookingDeclineDeadlineHours: 24 - (index % 5),
        },
        cancellationPolicy: ['Flexible', 'Moderate', 'Strict'][index % 3],
        availableFrom: availableFrom,
        availableTo: availableTo,
        suitableFor: ['Wedding', 'Conference', 'Party', 'Concert'].slice(
          0,
          (index % 4) + 1
        ),
      };
    }
  );

  public createNewService(request: CreateServiceRequest): Observable<any> {
    //return this.http.post(`${this.apiUrl}`, request);

    //test data
    return of({
      message: 'Service created successfully',
      error: null,
    });
  }

  getTopServices(): Observable<ServiceProduct[]> {
    const topServices = this.services.slice(0, 5);
    return of(topServices);
  }

  getAllServices(): Observable<ServiceProduct[]> {
    return of(this.services);
  }

  getServiceById(id: string): Observable<ServiceProduct> {
    const service = this.services.find((service) => service.id === id);
    if (service) {
      return of(service);
    } else {
      return throwError(() => new Error('Service/Product not found'));
    }
  }
}
