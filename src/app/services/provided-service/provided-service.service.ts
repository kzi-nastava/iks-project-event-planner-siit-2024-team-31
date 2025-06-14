import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from '../../types/models/service.model';
import { baseUrl } from '../baseUrl';

@Injectable({
  providedIn: 'root',
})
export class ProvidedServiceService {
  constructor(private http: HttpClient) {}

  private apiUrl = baseUrl + 'service';

  public getTopServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/top`);
  }

  public getMyServices(): Observable<Service[]> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<Service[]>(`${this.apiUrl}/my`, { headers });
  }
}
