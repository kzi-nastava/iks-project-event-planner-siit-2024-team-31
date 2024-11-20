import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Event } from '../../models/event.model';
import { EventService } from '../../services/events/event.service';
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

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents('New York').subscribe((events) => {
      this.events = events;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredEvents = this.events.filter((event) =>
      event.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
