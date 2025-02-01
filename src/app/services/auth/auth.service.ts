import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CurrentUser} from '../../types/currentUser';
import {LoginResponse} from '../../types/dto/responses/loginResponse';
import {RegisterResponse} from '../../types/dto/responses/registerResponse';
import {baseUrl} from "../baseUrl";

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private baseApiUrl = baseUrl + 'auth';

	public currentUser: CurrentUser | null = null;

	private userRoleSubject = new BehaviorSubject<string | null>(null);

	userRole$ = this.userRoleSubject.asObservable();
	isAuthenticated$ = this.userRole$.pipe(map((role) => !!role));

	constructor(private http: HttpClient) {
	}

	login(email: string, password: string): Observable<void> {
		return this.http
			.post<LoginResponse>(`${this.baseApiUrl}/login`, {email, password})
			.pipe(
				map((response) => {
					document.cookie = `token=${response.token}`;
					localStorage.setItem('token', response.token);
					localStorage.setItem('role', response.role);
					this.userRoleSubject.next(response.role);
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
		this.currentUser = null;
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		this.userRoleSubject.next(null);
	}

	getToken(): string | null {
		return localStorage.getItem('token'); // Или sessionStorage
	}

	getRole(): string | null {
		return localStorage.getItem('role');
	}

	isAuthenticated(): boolean {
		return !!this.getToken(); // Проверка наличия токена
	}

	hasRole(requiredRoles: string[]): boolean {
		const userRole = this.getRole();
		return userRole ? requiredRoles.includes(userRole) : false;
	}

	initializeAuthState(): void {
		const token = this.getToken();
		const role = this.getRole();

		if (token && role) {
			this.userRoleSubject.next(role);
		} else {
			this.userRoleSubject.next(null);
		}
	}
}
