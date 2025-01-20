import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { AuthService } from './services/auth/auth.service';
import { EventService } from './services/events/event.service';
import { ServiceProductService } from './services/service-products/service-products.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [NavbarComponent, RouterModule, HttpClientModule],
  providers: [AuthService, EventService, ServiceProductService],
})
export class AppComponent {
  title = 'Event Planner';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.initializeAuthState();
  }
}
