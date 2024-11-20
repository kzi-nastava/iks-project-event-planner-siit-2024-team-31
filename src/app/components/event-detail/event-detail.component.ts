import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/events/event.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  standalone: true
})
export class EventDetailComponent implements OnInit {
  event!: Event;

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
}
