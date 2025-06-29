import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EventService } from '../../../services/events/event.service';
import { Event } from '../../../types/models/event.model';
import { Page } from '../../../types/page';

@Component({
  selector: 'app-od-events-component',
  imports: [CommonModule, RouterModule],
  standalone: true,
  providers: [],
  templateUrl: './od-events-component.component.html',
})
export class OdEventsComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;
  totalElements = 0;

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getMyEvents(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<Event>) => {
        this.events = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my events:', error);
        this.error = 'Failed to load events. Please try again.';
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadMyEvents();
  }

  navigateToEvent(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  editEvent(eventId: string): void {
    // Navigate to edit event page when implemented
    console.log('Edit event:', eventId);
  }

  deleteEvent(eventId: string): void {
    // Implement delete functionality when backend supports it
    console.log('Delete event:', eventId);
  }

  getEventStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Helper methods for photo handling
  hasEventImages(event: Event): boolean {
    return !!(event.photos && event.photos.length > 0);
  }

  getEventFirstImageUrl(event: Event): string | null {
    if (event.photos && event.photos.length > 0) {
      return event.photos[0].tempPhotoUrl;
    }
    return null;
  }
}
