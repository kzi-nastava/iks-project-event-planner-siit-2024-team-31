import {Injectable} from '@angular/core';
import {
	HTTP_INTERCEPTORS,
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthService} from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private router: Router, private authService: AuthService) {
	}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				if (error.status === 401) {
					const errorMessage = error.error?.message || '';

					if (errorMessage.includes("Token expired")) {
						this.authService.logout();
						alert("Session expired. Please log in again.");
						this.router.navigate(['/login']);
					} else if (errorMessage.includes("Invalid credentials")) {
						alert("Invalid credentials. Please check your login details.");
					} else {
						alert("Unauthorized access! Contact support.");
					}
				}

				return throwError(() => error);
			})
		);
	}
}

export const AuthInterceptorProvider = {
	provide: HTTP_INTERCEPTORS,
	useClass: AuthInterceptor,
	multi: true,
};