// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = ''; // API auth endpoint (empty for mock data)
  private currentUser: User | null = null;

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRoleSubject.asObservable();

  isAuthenticated$ = this.userRole$.pipe(map((role) => !!role));

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const fakeResponse = {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'AK',
      },
    };
    return of(fakeResponse).pipe(
      tap((response) => {
        this.currentUser = response.user;
        localStorage.setItem('token', response.token);
        this.userRoleSubject.next(response.user.role);
      })
    );
  }

  register(user: User): Observable<any> {
    const fakeRegisterResponse = {
      token: 'fake-jwt-token-register',
      user: {
        id: 2,
        firstName: user.firstName || 'New',
        lastName: user.lastName || 'User',
        email: user.email,
        role: user.role || 'PUP',
      },
    };
    return of(fakeRegisterResponse).pipe(
      tap((response) => {
        if (response) {
          this.currentUser = response.user;
          localStorage.setItem('token', response.token);
          this.userRoleSubject.next(response.user.role);
          console.log('Успешная регистрация:', response.user);
        }
      })
    );
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('token');
    this.userRoleSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return this.userRoleSubject.getValue();
  }
}
