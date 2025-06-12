import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/events/event.service';
import { ProductService } from '../../services/product/products.service';
import { Event } from '../../types/models/event.model';
import { ServiceProduct } from '../../types/models/service-product.model';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventListComponent } from '../event-list/event-list.component';
import { ServiceCardComponent } from '../service-card/service-card.component';
import { ServiceListComponent } from '../service-list/service-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent,
    EventListComponent,
    ServiceCardComponent,
    ServiceListComponent,
  ],
})
export class HomeComponent implements OnInit {
  topEvents: Event[] = [];
  topServices: ServiceProduct[] = [];

  constructor(
    private eventService: EventService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadTopEvents();
    this.loadTopServices();
  }

  loadTopEvents() {
    this.eventService.getTopEvents().subscribe((events) => {
      this.topEvents = events;
    });
  }

  loadTopServices() {
    this.productService.getTopServices().subscribe((services) => {
      this.topServices = services;
    });
  }
}
