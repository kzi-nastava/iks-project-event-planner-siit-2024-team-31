import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { EventService } from '../../services/events/event.service';
import { FavoritesService } from '../../services/favorites/favorites.service';
import { Event } from '../../types/models/event.model';
import { MapComponent } from '../od/map/map.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  standalone: true,
  imports: [CommonModule, MapComponent],
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  error: string | null = null;
  imageError = false;
  selectedImageIndex = 0;
  showImageModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEvent(eventId);
    } else {
      this.error = 'Event ID not found';
      this.loading = false;
    }
  }

  loadEvent(eventId: string): void {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.error = 'Failed to load event details';
        this.loading = false;
      },
    });
  }

  onImageError(event: any): void {
    this.imageError = true;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openImageModal(): void {
    if (this.hasImages()) {
      this.showImageModal = true;
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  nextImage(): void {
    const imageCount = this.getImageCount();
    if (imageCount > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % imageCount;
    }
  }

  previousImage(): void {
    const imageCount = this.getImageCount();
    if (imageCount > 1) {
      this.selectedImageIndex =
        this.selectedImageIndex === 0
          ? imageCount - 1
          : this.selectedImageIndex - 1;
    }
  }

  getEventDuration(): string {
    if (!this.event) return '';

    const start = new Date(this.event.startTime);
    const end = new Date(this.event.endTime);
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const hours = diffInHours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${
        hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''
      }`;
    }
  }

  getAgendaDuration(): string {
    if (!this.event || !this.event.agenda || this.event.agenda.length === 0)
      return '';

    const firstStart = new Date(this.event.agenda[0].startTime);
    const lastEnd = new Date(
      this.event.agenda[this.event.agenda.length - 1].endTime
    );
    const diffInMs = lastEnd.getTime() - firstStart.getTime();
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const hours = diffInHours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${
        hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''
      }`;
    }
  }

  isEventFavorite(): boolean {
    if (!this.event || !this.isUserAuthenticated()) return false;
    return this.favoritesService.isEventFavorite(parseInt(this.event.id));
  }

  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleFavorite(): void {
    if (!this.event) return;

    if (!this.isUserAuthenticated()) {
      // Redirect to login page or show login prompt
      this.router.navigate(['/login']);
      return;
    }

    const eventId = parseInt(this.event.id);
    if (this.isEventFavorite()) {
      this.favoritesService.removeFavoriteEvent(eventId).subscribe();
    } else {
      this.favoritesService.addFavoriteEvent(eventId).subscribe();
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  shareEvent(): void {
    if (navigator.share && this.event) {
      navigator.share({
        title: this.event.name,
        text: this.event.description,
        url: window.location.href,
      });
    } else if (this.event) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        // You might want to show a toast notification here
        console.log('Event link copied to clipboard');
      });
    }
  }

  getLocationAddress(): string {
    if (!this.event || !this.event.location) {
      return 'Location not specified';
    }
    return (
      this.event.location.address ||
      `${this.event.location.lat}, ${this.event.location.lng}`
    );
  }

  // Helper methods for photo handling
  hasImages(): boolean {
    if (!this.event) return false;
    return !!(this.event.photos && this.event.photos.length > 0);
  }

  getImageUrls(): string[] {
    if (!this.event) return [];

    if (this.event.photos && this.event.photos.length > 0) {
      return this.event.photos.map((photo) => photo.tempPhotoUrl);
    }

    return [];
  }

  getImageCount(): number {
    if (!this.event) return 0;
    return this.event.photos ? this.event.photos.length : 0;
  }

  getCurrentImageUrl(): string | null {
    if (!this.event || !this.event.photos || this.event.photos.length === 0) {
      return null;
    }

    if (
      this.selectedImageIndex >= 0 &&
      this.selectedImageIndex < this.event.photos.length
    ) {
      return this.event.photos[this.selectedImageIndex].tempPhotoUrl;
    }

    return null;
  }
}
