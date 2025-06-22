import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  onImageError(event: any): void {
    this.imageError = true;
  }
}
