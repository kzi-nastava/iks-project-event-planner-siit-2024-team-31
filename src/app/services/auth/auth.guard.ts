import { inject, Injectable } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  static canMatch: CanMatchFn = (route, segments) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles: string[] = route.data?.['roles'] || [];
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
      router.navigate(['/login']);
      return false;
    }

    if (requiredRoles.length > 0 && !authService.hasRole(requiredRoles)) {
      router.navigate(['/access-denied']);
      return false;
    }

    return true;
  };
}
