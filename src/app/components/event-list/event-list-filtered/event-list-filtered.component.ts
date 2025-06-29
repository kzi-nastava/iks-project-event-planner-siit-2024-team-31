import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { EventService } from '../../../services/events/event.service';
import { EventFilters } from '../../../types/filter.interface';
import { Event } from '../../../types/models/event.model';
import { Page } from '../../../types/page';
import { EventCardComponent } from '../../event-card/event-card.component';
import { EventFilterComponent } from '../../utils/event-filter/event-filter.component';

@Component({
  selector: 'app-event-list-filtered',
  standalone: true,
  imports: [CommonModule, EventCardComponent, EventFilterComponent],
  templateUrl: './event-list-filtered.component.html',
})
export class EventListFilteredComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<EventFilters>();

  events: Event[] = [];
  paginatedEvents: Event[] = [];

  currentPage = 0; // API uses 0-based pagination
  pageSize = 9;
  totalPages = 1;
  totalElements = 0;
  loading = false;
  error: string | null = null;

  currentFilters: EventFilters = {};

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.setupFilterDebouncing();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterDebouncing(): void {
    this.filterSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap((filters) => {
          this.currentFilters = filters;
          this.currentPage = 0; // Reset to first page when filters change
          return this.loadEventsWithFilters(filters);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (page: Page<Event>) => {
          this.handleEventsResponse(page);
        },
        error: (error: any) => {
          this.handleError(error);
        },
      });
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    // Load initial events without filters
    this.eventService
      .searchEvents('', this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: Page<Event>) => {
          this.handleEventsResponse(page);
        },
        error: (error: any) => {
          this.handleError(error);
        },
      });
  }

  private loadEventsWithFilters(filters: EventFilters) {
    this.loading = true;
    this.error = null;

    // Use the new filterEvents method for server-side filtering
    return this.eventService.filterEvents(
      filters,
      this.currentPage,
      this.pageSize
    );
  }

  private handleEventsResponse(page: Page<Event>): void {
    this.events = page.content;
    this.paginatedEvents = page.content;
    this.totalPages = page.totalPages;
    this.totalElements = page.totalElements;
    this.loading = false;
  }

  private handleError(error: any): void {
    console.error('Error loading events:', error);
    this.error = 'Failed to load events. Please try again.';
    this.loading = false;
  }

  applyFilters(filters: EventFilters): void {
    this.filterSubject$.next(filters);
  }

  onResetFilters(): void {
    this.currentFilters = {};
    this.currentPage = 0;
    this.loadEvents();
  }

  // Pagination methods
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCurrentPage();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadCurrentPage();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCurrentPage();
    }
  }

  private loadCurrentPage(): void {
    if (Object.keys(this.currentFilters).length > 0) {
      // Load with current filters
      this.loadEventsWithFilters(this.currentFilters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (page: Page<Event>) => {
            this.handleEventsResponse(page);
          },
          error: (error: any) => {
            this.handleError(error);
          },
        });
    } else {
      // Load without filters
      this.loadEvents();
    }
  }

  // Helper methods for template
  get hasEvents(): boolean {
    return this.events.length > 0;
  }

  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  get currentPageDisplay(): number {
    return this.currentPage + 1; // Display 1-based page numbers
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
