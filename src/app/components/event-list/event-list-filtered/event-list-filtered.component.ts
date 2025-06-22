import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../../services/events/event.service';
import { Event } from '../../../types/models/event.model';
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

  events: Event[] = [];
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];

  currentPage = 1;
  pageSize = 8;
  totalPages = 1;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): void {
    this.eventService
      .getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events: Event[]) => {
          this.events = events;
          this.filteredEvents = [...this.events];
          this.updatePagination();
        },
        error: (error: any) => {
          console.error('Error loading events:', error);
        },
      });
  }

  applyFilters(filters: any): void {
    // Simple client-side filtering
    this.filteredEvents = this.events.filter((event) => {
      // Add your filter logic here based on the filters object
      return true; // For now, return all events
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    this.changePage(this.currentPage);
  }

  private changePage(page: number): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }
}
