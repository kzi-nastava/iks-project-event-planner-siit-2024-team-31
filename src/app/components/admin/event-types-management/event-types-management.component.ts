import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {
	EventTypesService
} from '../../../services/event-types/event-types.service';
import {
	EventTypeCardComponent
} from '../event-type-card/event-type-card.component';
import {EventTypeDTO} from "../../../types/dto/eventTypeDTO";
import {FormsModule} from "@angular/forms";

@Component({
	selector: 'app-event-types-management',
	imports: [EventTypeCardComponent, CommonModule, FormsModule],
	providers: [EventTypesService],
	templateUrl: './event-types-management.component.html',
	standalone: true,
})
export class EventTypesManagementComponent implements OnInit {
	constructor(private eventTypesService: EventTypesService) {
	}

	eventTypes: EventTypeDTO[] = [];
	currentPage = 1;
	totalPages = 0;
	itemsPerPage = 5;
	keyword = '';


	ngOnInit(): void {
		this.searchEventTypes();
	};

	searchEventTypes(): void {
		this.eventTypesService
			.searchEventTypes(this.keyword, this.currentPage, this.itemsPerPage)
			.subscribe((response) => {
				this.eventTypes = response.content;
				this.totalPages = response.totalPages;
			});
	};
	
	changePage(page: number): void {
		if (page > 0 && page <= this.totalPages) {
			this.currentPage = page;
			this.searchEventTypes();
		}
	};
}
