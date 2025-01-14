import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/events/event.service';
import { Event } from '../../types/models/event.model';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  standalone: true,
  imports: [CommonModule, EventCardComponent, FormsModule],
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  searchTerm: string = '';
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6; // Number of items per page
  totalPages: number = 1;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe((events) => {
      this.events = events;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredEvents = this.events.filter((event) =>
      event.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredEvents.length / this.pageSize);
    this.changePage(1); // Reset to first page after filtering
  }

  changePage(page: number) {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
  }
}
