import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Event } from '../../models/event.model';
import { ServiceProduct } from '../../models/service-product.model';
import { EventService } from '../../services/events/event.service';
import { ServiceProductService } from '../../services/service-products/service-products.service';
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
    private serviceProductService: ServiceProductService
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
    this.serviceProductService.getTopServices().subscribe((services) => {
      this.topServices = services;
    });
  }
}
