import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/events/event.service';
import { Event } from '../../types/models/event.model';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class EventDetailComponent implements OnInit {
  event!: Event;
  imageError = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getEventById(eventId).subscribe((event) => {
      this.event = event;
    });
  }

  onImageError(event: any): void {
    this.imageError = true;
  }
}
