import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
	EventTypesService
} from '../../../services/event-types/event-types.service';
import {EventTypeFullDTO} from '../../../types/dto/eventTypeFullDTO';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
	selector: 'app-event-type-page',
	templateUrl: './event-type-page.component.html',
	imports: [CommonModule, FormsModule],
	styleUrls: ['./event-type-page.component.scss']
})
export class EventTypePageComponent implements OnInit {
	eventType!: EventTypeFullDTO;
	isLoading = true;
	errorMessage = '';

	constructor(
		private route: ActivatedRoute,
		private eventTypesService: EventTypesService
	) {
	}

	ngOnInit() {
		const id = Number(this.route.snapshot.paramMap.get('id'));
		this.loadEventType(id);
	}

	private loadEventType(id: number): void {
		this.isLoading = true;
		this.eventTypesService.getEventTypeById(id).subscribe({
			next: (data) => {
				this.eventType = data;
				this.isLoading = false;
			},
			error: (err) => {
				this.errorMessage = 'Failed to load event type';
				this.isLoading = false;
				console.error(err);
			}
		});
	}

	onEdit(): void {
		// Реализуйте переход на страницу редактирования
		// или откройте модальное окно редактирования
	}

	onDeactivate(): void {
		if (confirm('Are you sure you want to deactivate this event type?')) {
			this.eventTypesService.updateEventTypeStatus(this.eventType.id, 'INACTIVE')
				.subscribe({
					next: (response) => {
						alert('Event type deactivated successfully');
						this.loadEventType(this.eventType.id);
					},
					error: (err) => {
						console.error('Deactivation failed:', err);
						alert('Error deactivating event type');
					}
				});
		}
	}
}