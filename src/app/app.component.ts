import {HttpClientModule} from '@angular/common/http';
import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NavbarComponent} from './components/layout/navbar/navbar.component';
import {AuthService} from './services/auth/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	standalone: true,
	imports: [NavbarComponent, RouterModule, HttpClientModule],
	providers: [],
})
export class AppComponent {
	title = 'Event Planner';

	constructor(private authService: AuthService) {
	}

	ngOnInit(): void {
		this.authService.initializeAuthState();
	}
}
