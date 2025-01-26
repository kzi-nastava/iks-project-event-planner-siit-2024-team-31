import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {EventTypeDTO} from '../../../types/dto/eventTypeDTO';
import {
	EventTypesService
} from '../../../services/event-types/event-types.service';
import {
	EventTypeCardComponent
} from '../event-type-card/event-type-card.component';

@Component({
	selector: 'app-event-types-management',
	standalone: true,
	imports: [EventTypeCardComponent, CommonModule, FormsModule, RouterModule],
	providers: [EventTypesService],
	templateUrl: './event-types-management.component.html',
})
export class EventTypesManagementComponent implements OnInit {
	eventTypes: EventTypeDTO[] = [];
	currentPage = 1;
	totalPages = 0;
	itemsPerPage = 5;
	keyword = '';

	showCreateForm = false;

	newEventType: Partial<EventTypeDTO> = {
		name: '',
		description: '',
	};

	constructor(private eventTypesService: EventTypesService) {
	}

	ngOnInit(): void {
		this.searchEventTypes();
	}

	searchEventTypes(): void {
		this.eventTypesService
			.searchEventTypes(this.keyword, this.currentPage, this.itemsPerPage)
			.subscribe((response) => {
				this.eventTypes = response.content;
				this.totalPages = response.totalPages;
			});
	}

	changePage(page: number): void {
		if (page > 0 && page <= this.totalPages) {
			this.currentPage = page;
			this.searchEventTypes();
		}
	}

	openCreateForm(): void {
		this.newEventType = {name: '', description: ''};
		this.showCreateForm = true;
	}

	closeCreateForm(): void {
		this.showCreateForm = false;
	}

	createNewEventType(): void {
		// this.eventTypesService.createEventType(this.newEventType).subscribe({
		// 	next: (created) => {
		// 		// При успехе: скрываем форму, обновляем список
		// 		this.showCreateForm = false;
		// 		this.searchEventTypes(); // Обновляем текущую страницу
		// 	},
		// 	error: (err) => {
		// 		console.error('Error creating event type:', err);
		// 	},
		// });
	}
}