import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { LoginResponse } from '../../types/dto/responses/loginResponse'
import { RegisterResponse } from '../../types/dto/responses/registerResponse'
import { Role } from '../../types/roles'
import { baseUrl } from '../baseUrl'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseApiUrl = baseUrl + 'auth';

  private userRoleSubject = new BehaviorSubject<Role | null>(null);

  userRole$ = this.userRoleSubject.asObservable();
  isAuthenticated$ = this.userRole$.pipe(map((role) => !!role));

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.baseApiUrl}/login`, { email, password })
      .pipe(
        map((response) => {
          if (Object.values(Role).includes(response.role as Role)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            this.userRoleSubject.next(response.role as Role);
          } else {
            this.userRoleSubject.next(null);
            throw new Error('Invalid role');
          }
        })
      );
  }

  register(formData: FormData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseApiUrl}/signup`,
      formData
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.userRoleSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): Role | null {
    const roleStr = localStorage.getItem('role');
    if (Object.values(Role).includes(roleStr as Role)) {
      return roleStr as Role;
    } else return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(requiredRoles: Role[]): boolean {
    const userRole = this.getRole();
    return userRole ? requiredRoles.includes(userRole) : false;
  }

  initializeAuthState(): void {
    const token = this.getToken();
    const role = this.getRole();

    if (token && role && Object.values(Role).includes(role as Role)) {
      this.userRoleSubject.next(role as Role);
    } else {
      this.userRoleSubject.next(null);
    }
  }

  sendRecoveryCode(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseApiUrl}/send-recovery-code`, {
      email,
    });
  }

  verifyRecoveryCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.baseApiUrl}/verify-recovery-code`, {
      email,
      code,
    });
  }

  resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Observable<void> {
    return this.http.post<void>(`${this.baseApiUrl}/reset-password`, {
      email,
      code,
      newPassword,
    });
  }
}
