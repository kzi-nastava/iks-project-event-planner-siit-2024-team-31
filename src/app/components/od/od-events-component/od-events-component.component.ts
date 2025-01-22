import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EventService } from '../../../services/events/event.service';

@Component({
  selector: 'app-od-events-component',
  imports: [CommonModule, RouterModule],
  standalone: true,
  providers: [],
  templateUrl: './od-events-component.component.html',
})
export class OdEventsComponent {
  constructor(private eventService: EventService, private router: Router) {}
}
