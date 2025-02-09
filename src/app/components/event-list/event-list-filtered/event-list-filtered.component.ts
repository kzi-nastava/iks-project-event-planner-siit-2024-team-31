import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/events/event.service';
import { Event } from '../../../types/models/event.model';
import { EventCardComponent } from '../../event-card/event-card.component';
import { EventFilterComponent } from '../../utils/event-filter/event-filter.component';

@Component({
  selector: 'app-event-list-filtered',
  imports: [
    EventFilterComponent,
    FormsModule,
    CommonModule,
    EventCardComponent,
  ],
  templateUrl: './event-list-filtered.component.html',
  standalone: true,
})
export class EventListFilteredComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];

  currentPage: number = 1;
  pageSize: number = 16; // 4x4 грид
  totalPages: number = 0;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe((events) => {
      this.events = events;
      this.filteredEvents = [...this.events];
      this.calculatePagination();
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    this.changePage(1);
  }

  changePage(page: number) {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  applyFilters(filters: any) {
    this.filteredEvents = this.events.filter((event) => {
      const matchesType =
        !filters.selectedTypes.length ||
        filters.selectedTypes.includes(event.type);

      const matchesCity =
        !filters.selectedCities.length ||
        filters.selectedCities.includes(event.location.city);

      const matchesLocation =
        !filters.selectedLocations.length ||
        filters.selectedLocations.includes(event.location.object);

      const matchesDate =
        (!filters.fromDate ||
          new Date(event.dateStart) >= new Date(filters.fromDate)) &&
        (!filters.toDate ||
          new Date(event.dateEnd) <= new Date(filters.toDate));

      const matchesGuests =
        event.maxNumberOfGuests >= filters.minGuests &&
        event.maxNumberOfGuests <= filters.maxGuests;

      return (
        matchesType &&
        matchesCity &&
        matchesLocation &&
        matchesDate &&
        matchesGuests
      );
    });

    this.calculatePagination();
  }
}
