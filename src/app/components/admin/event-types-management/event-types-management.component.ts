import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { EventTypeCardComponent } from '../event-type-card/event-type-card.component';

@Component({
  selector: 'app-event-types-management',
  imports: [EventTypeCardComponent, CommonModule],
  providers: [EventTypesService],
  templateUrl: './event-types-management.component.html',
  standalone: true,
})
export class EventTypesManagementComponent {
  constructor(private eventTypesService: EventTypesService) {}
  eventTypes = [
    {
      id: 1,
      title: 'Event Type 1',
      description: 'Description for Event Type 1',
    },
    {
      id: 2,
      title: 'Event Type 2',
      description: 'Description for Event Type 2',
    },
    {
      id: 3,
      title: 'Event Type 3',
      description: 'Description for Event Type 3',
    },
    {
      id: 4,
      title: 'Event Type 4',
      description: 'Description for Event Type 4',
    },
    {
      id: 5,
      title: 'Event Type 5',
      description: 'Description for Event Type 5',
    },
    {
      id: 6,
      title: 'Event Type 6',
      description: 'Description for Event Type 6',
    },
    {
      id: 7,
      title: 'Event Type 7',
      description: 'Description for Event Type 7',
    },
    {
      id: 8,
      title: 'Event Type 8',
      description: 'Description for Event Type 8',
    },
    {
      id: 9,
      title: 'Event Type 9',
      description: 'Description for Event Type 9',
    },
    {
      id: 10,
      title: 'Event Type 10',
      description: 'Description for Event Type 10',
    },
  ];

  itemsPerPage = 5;
  currentPage = 1;
  totalPages = Math.ceil(this.eventTypes.length / this.itemsPerPage);

  get paginatedEventTypes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.eventTypes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }
}
