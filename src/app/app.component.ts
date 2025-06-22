import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { AuthService } from './services/auth/auth.service';
import { FavoritesService } from './services/favorites/favorites.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [NavbarComponent, RouterModule, HttpClientModule],
  providers: [],
})
export class AppComponent implements OnInit {
  title = 'Event Planner';

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.authService.initializeAuthState();

    // Load favorites if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.favoritesService.loadAllFavorites();
    }
  }
}
