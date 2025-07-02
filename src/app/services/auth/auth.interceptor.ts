import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { NotificationService } from '../notification.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // Clone the request and add the authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip error handling for login and auth-related requests
      const isAuthRequest =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/signup') ||
        req.url.includes('/api/auth/send-recovery-code') ||
        req.url.includes('/api/auth/verify-recovery-code') ||
        req.url.includes('/api/auth/reset-password');

      if (isAuthRequest) {
        // Let the component handle auth-related errors
        return throwError(() => error);
      }

      if (error.status === 401) {
        const errorMessage = error.error?.error || '';

        if (errorMessage.includes('Invalid token')) {
          authService.logout();
          notification.sessionExpired();
          router.navigate(['/login']);
        } else if (errorMessage.includes('Invalid credentials')) {
          notification.authError(
            'Invalid credentials. Please check your login details.'
          );
        } else {
          notification.authError('Unauthorized access! Contact support.');
        }
      } else if (error.status >= 500) {
        notification.networkError('Server error. Please try again later.');
      } else if (error.status === 0) {
        notification.networkError();
      }

      return throwError(() => error);
    })
  );
};
