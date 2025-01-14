import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../types/models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class EventCardComponent {
  @Input() event!: Event;
}
