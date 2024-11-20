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
  imports: [NavbarComponent, RouterModule],
  providers: [AuthService, EventService, ServiceProductService],
})
export class AppComponent {
  title = 'ep2024-frontend-angular17-tailwind';
}
