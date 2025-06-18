import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EventService } from '../../services/events/event.service';
import { ProductService } from '../../services/product/products.service';
import { ProvidedServiceService } from '../../services/provided-service/provided-service.service';
import { Event } from '../../types/models/event.model';
import { Product } from '../../types/models/product.model';
import { Service } from '../../types/models/service.model';
import { EventCardComponent } from '../event-card/event-card.component';
import { ServiceCardComponent } from '../service-card/service-card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EventCardComponent,
    ServiceCardComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  topEvents: Event[] = [];
  topServices: Service[] = [];
  topProducts: Product[] = [];

  // Paginated items from server
  paginatedEvents: Event[] = [];
  paginatedServices: Service[] = [];
  paginatedProducts: Product[] = [];

  // Search terms
  eventSearchTerm: string = '';
  serviceSearchTerm: string = '';
  productSearchTerm: string = '';

  // Search subjects for debouncing
  private eventSearchSubject = new Subject<string>();
  private serviceSearchSubject = new Subject<string>();
  private productSearchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Pagination
  eventsCurrentPage: number = 0; // Server pagination is 0-based
  servicesCurrentPage: number = 0;
  productsCurrentPage: number = 0;
  itemsPerPage: number = 8;

  // Loading states
  eventsLoading: boolean = false;
  servicesLoading: boolean = false;
  productsLoading: boolean = false;

  // Total pages (we'll need to track this differently since we don't have total count from server)
  eventsHasMore: boolean = true;
  servicesHasMore: boolean = true;
  productsHasMore: boolean = true;

  constructor(
    private eventService: EventService,
    private productService: ProductService,
    private providedServiceService: ProvidedServiceService
  ) {}

  ngOnInit(): void {
    this.setupSearchDebouncing();
    this.loadTopEvents();
    this.loadTopServices();
    this.loadTopProducts();
    this.loadPaginatedEvents();
    this.loadPaginatedServices();
    this.loadPaginatedProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebouncing(): void {
    // Event search debouncing
    this.eventSearchSubject
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing
        distinctUntilChanged(), // Only emit if value is different from previous
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.eventsCurrentPage = 0;
        this.loadPaginatedEvents();
      });

    // Service search debouncing
    this.serviceSearchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.servicesCurrentPage = 0;
        this.loadPaginatedServices();
      });

    // Product search debouncing
    this.productSearchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.productsCurrentPage = 0;
        this.loadPaginatedProducts();
      });
  }

  loadTopEvents() {
    this.eventService.getTopEvents().subscribe({
      next: (events) => {
        this.topEvents = events;
      },
      error: (error) => {
        console.error('Error loading top events:', error);
      },
    });
  }

  loadTopServices() {
    this.providedServiceService.getTopServices().subscribe({
      next: (services) => {
        this.topServices = services;
      },
      error: (error) => {
        console.error('Error loading top services:', error);
      },
    });
  }

  loadTopProducts() {
    this.productService.getTopProducts().subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
      },
    });
  }

  // Event pagination
  loadPaginatedEvents() {
    this.eventsLoading = true;
    this.eventService
      .getEventsPage(
        this.eventsCurrentPage,
        this.itemsPerPage,
        this.eventSearchTerm
      )
      .subscribe({
        next: (events) => {
          this.paginatedEvents = events;
          this.eventsHasMore = events.length === this.itemsPerPage;
          this.eventsLoading = false;
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsLoading = false;
        },
      });
  }

  onEventSearchChange() {
    this.eventSearchSubject.next(this.eventSearchTerm);
  }

  changeEventsPage(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.eventsCurrentPage > 0) {
      this.eventsCurrentPage--;
      this.loadPaginatedEvents();
    } else if (direction === 'next' && this.eventsHasMore) {
      this.eventsCurrentPage++;
      this.loadPaginatedEvents();
    }
  }

  // Service pagination
  loadPaginatedServices() {
    this.servicesLoading = true;
    this.providedServiceService
      .getServicesPageWithMeta(
        this.servicesCurrentPage,
        this.itemsPerPage,
        this.serviceSearchTerm
      )
      .subscribe({
        next: (response) => {
          this.paginatedServices = response.content || [];
          this.servicesHasMore = !response.last;
          this.servicesLoading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.servicesLoading = false;
          this.paginatedServices = [];
          this.servicesHasMore = false;
        },
      });
  }

  onServiceSearchChange() {
    this.serviceSearchSubject.next(this.serviceSearchTerm);
  }

  changeServicesPage(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.servicesCurrentPage > 0) {
      this.servicesCurrentPage--;
      this.loadPaginatedServices();
    } else if (direction === 'next' && this.servicesHasMore) {
      this.servicesCurrentPage++;
      this.loadPaginatedServices();
    }
  }

  // Product pagination
  loadPaginatedProducts() {
    this.productsLoading = true;
    this.productService
      .getProductsPageWithMeta(
        this.productsCurrentPage,
        this.itemsPerPage,
        this.productSearchTerm
      )
      .subscribe({
        next: (response) => {
          this.paginatedProducts = response.content || [];
          this.productsHasMore = !response.last;
          this.productsLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.productsLoading = false;
          this.paginatedProducts = [];
          this.productsHasMore = false;
        },
      });
  }

  onProductSearchChange() {
    this.productSearchSubject.next(this.productSearchTerm);
  }

  changeProductsPage(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.productsCurrentPage > 0) {
      this.productsCurrentPage--;
      this.loadPaginatedProducts();
    } else if (direction === 'next' && this.productsHasMore) {
      this.productsCurrentPage++;
      this.loadPaginatedProducts();
    }
  }

  // Helper methods to create placeholder arrays for consistent grid layout
  getEventPlaceholders(): any[] {
    const currentCount = this.paginatedEvents.length;
    const targetCount = 8;
    const placeholdersNeeded = Math.max(0, targetCount - currentCount);
    return new Array(placeholdersNeeded).fill(null);
  }

  getServicePlaceholders(): any[] {
    const currentCount = this.paginatedServices.length;
    const targetCount = 8;
    const placeholdersNeeded = Math.max(0, targetCount - currentCount);
    return new Array(placeholdersNeeded).fill(null);
  }

  getProductPlaceholders(): any[] {
    const currentCount = this.paginatedProducts.length;
    const targetCount = 8;
    const placeholdersNeeded = Math.max(0, targetCount - currentCount);
    return new Array(placeholdersNeeded).fill(null);
  }
}
