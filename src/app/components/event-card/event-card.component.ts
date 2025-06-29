import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Event } from '../../types/models/event.model';
import { FavoriteButtonComponent } from '../all-users-components/favorite-button/favorite-button.component';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule, FavoriteButtonComponent],
})
export class EventCardComponent {
  @Input() event!: Event;
  imageError = false;

  constructor(private router: Router) {}

  navigateToDetails() {
    this.router.navigate(['/event', this.event.id]);
  }

  onImageError() {
    this.imageError = true;
  }

  // Helper method to get the first image URL from new structure
  getFirstImageUrl(): string | null {
    if (this.event.photos && this.event.photos.length > 0) {
      return this.event.photos[0].tempPhotoUrl;
    }
    return null;
  }

  // Helper method to check if event has images
  hasImages(): boolean {
    return !!(this.event.photos && this.event.photos.length > 0);
  }
}
