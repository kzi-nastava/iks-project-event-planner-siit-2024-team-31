import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserMyProfileResponse } from '../../types/dto/responses/userMyProfileResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  private apiUrlBase = 'http://localhost:3308/user';

  getUserProfile(): Observable<UserMyProfileResponse> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    return this.http.get<UserMyProfileResponse>(this.apiUrlBase, { headers });
  }
}
