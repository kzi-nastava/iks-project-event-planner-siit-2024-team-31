import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {Component, HostListener} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../../services/auth/auth.service';
import {Role} from "../../../types/roles";

@Component({
	selector: 'app-navbar',
	imports: [RouterModule, CommonModule, HttpClientModule],
	providers: [],
	templateUrl: './navbar.component.html',
})
export class NavbarComponent {
	registerButton = {text: 'Sign up', link: '/register'};
	loginButton = {text: 'Log in', link: '/login'};
	myProfileButton = {text: 'My profile', link: '/my-profile'};
	isAuthenticated$: Observable<boolean>;
	userRole: Role | null = null;
	isDropdownOpen = false;

	constructor(public authService: AuthService, private router: Router) {
		this.authService.userRole$.subscribe((role) => {
			this.userRole = role;
		});
		this.isAuthenticated$ = this.authService.isAuthenticated$;
	}

	toggleDropdown() {
		this.isDropdownOpen = !this.isDropdownOpen;
	}

	@HostListener('document:click', ['$event'])
	closeDropdown(event: MouseEvent) {
		if (!this.isDropdownOpen) return;
		this.isDropdownOpen = false;
	}

	logout() {
		this.authService.logout();
		this.router.navigate(['/login']);
	}

	protected readonly Role = Role;
}
