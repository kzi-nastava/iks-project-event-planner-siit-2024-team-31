import {Component, ViewChild} from '@angular/core';
import {MapComponent} from '../map/map.component';
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {EventType} from "../../../types/eventType";
import {Page} from "../../../types/page";
import {
	EventTypesService
} from "../../../services/event-types/event-types.service";
import {Event} from "../../../types/models/event.model"

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event-component.component.html',
	imports: [
		MapComponent,
		FormsModule,
		NgIf,
		NgForOf
	]
})
export class CreateEventComponent {

	eventData: Event = {
		id: "-1",
		name: '',
		description: '',
		startDate: '',
		endDate: '',
		maxNumGuests: 0,
		isPrivate: false,
		eventType: {
			id: 0,
			name: ''
		},
		location: null,
		agenda: null,
		budget: null,
		imageUrls: []
	};

	showMap: boolean = false;
	showAgendaCreation: boolean = false;
	showBudgetCreation: boolean = false;
	showEventTypeSelection: boolean = false;

	currentEventTypePage: number = 1;
	totalEventTypePages: number = 0;
	eventTypesPageSize: number = 5;
	paginatedEventTypes: EventType[] = [];
	eventTypesQuery: string = '';

	selectedLocation: {
		lat: number;
		lng: number;
		address: string;
	} | null = null;

	constructor(public eventTypesService: EventTypesService) {
		this.loadEventTypes();
	}

	@ViewChild(MapComponent)
	mapComponent!: MapComponent;

	// EVENT TYPE
	openEventTypeSelection(): void {
		this.showEventTypeSelection = true;
	}

	closeEventTypeSelection(): void {
		this.showEventTypeSelection = false;
	}

	loadEventTypes(): void {
		this.eventTypesService
			.searchEventTypes(this.eventTypesQuery, this.currentEventTypePage, this.eventTypesPageSize)
			.subscribe({
				next: (page: Page<EventType>) => {
					this.paginatedEventTypes = page.content;
					this.totalEventTypePages = page.totalPages;
				},
				error: (err) => console.error('Error loading event types:', err),
			});
	}

	onEventTypesQueryChange(): void {
		this.currentEventTypePage = 1;
		this.loadEventTypes();
	}

	previousEventTypePage(): void {
		if (this.currentEventTypePage > 1) {
			this.currentEventTypePage--;
			this.loadEventTypes();
		}
	}

	nextEventTypePage(): void {
		if (this.currentEventTypePage < this.totalEventTypePages) {
			this.currentEventTypePage++;
			this.loadEventTypes();
		}
	}

	isEventTypeSelected(type: EventType): boolean {
		return this.eventData.eventType.id === type.id;
	}

	// При выборе типа события через радио кнопку сразу обновляем eventData.eventType
	onSelectEventType(type: EventType): void {
		this.eventData.eventType = {...type};
	}

	confirmEventTypeSelection(): void {
		this.showEventTypeSelection = false;
	}

	// AGENDA
	openAgendaCreation(): void {
		this.showAgendaCreation = true;
	}

	closeAgendaCreation(): void {
		this.showAgendaCreation = false;
	}

	// BUDGET
	openBudgetCreation(): void {
		this.showBudgetCreation = true;
	}

	closeBudgetCreation(): void {
		this.showBudgetCreation = false;
	}

	// MAP
	openMap(): void {
		this.showMap = true;
	}

	closeMap(): void {
		this.showMap = false;
	}

	onSelectLocation(): void {
		if (this.mapComponent && this.mapComponent.selectedLocation) {
			this.selectedLocation = this.mapComponent.selectedLocation;
			this.showMap = false;
		} else {
			alert('Select a location on the map first.');
		}
	}

	onSubmit(): void {
		// Обработка сабмита формы
	}
}