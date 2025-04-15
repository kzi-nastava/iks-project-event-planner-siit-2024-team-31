import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AgendaItem} from "../../../types/models/agendaItem.model";
import {FormsModule} from "@angular/forms";
import {DatePipe, NgForOf} from "@angular/common";

@Component({
	selector: 'app-agenda-creation',
	imports: [
		FormsModule,
		NgForOf,
		DatePipe
	],
	templateUrl: './agenda-creation.component.html',
	styleUrls: ['./agenda-creation.component.scss']
})
export class AgendaCreationComponent {

	@Input() startDate: string = '';
	@Input() endDate: string = '';

	eventStart = new Date(this.startDate);
	eventEnd = new Date(this.endDate);

	currentAgendaItem: AgendaItem = {
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		location: ''
	};

	@Output() dataEmitter: EventEmitter<AgendaItem[]> = new EventEmitter();

	@Input() agenda: AgendaItem[] = [];

	addNewAgendaItem(): void {
		if (!this.currentAgendaItem.startTime || !this.currentAgendaItem.endTime) {
			alert('Select time limits for agenda item.');
			return;
		}

		const itemStart = new Date(this.currentAgendaItem.startTime);
		const itemEnd = new Date(this.currentAgendaItem.endTime);

		if (itemStart < this.eventStart || itemEnd > this.eventEnd) {
			alert('Time limits of agenda item have to be between event time' +
				' limits.');
			return;
		}

		if (itemStart >= itemEnd) {
			alert('Start of agenda item has to be after its end.');
			return;
		}

		this.agenda.push({...this.currentAgendaItem});

		this.currentAgendaItem = {
			title: '',
			description: '',
			startTime: '',
			endTime: '',
			location: ''
		};
	}

	createAgenda(): void {
		this.dataEmitter.emit(this.agenda)
	}

	removeAgendaItem(item: AgendaItem): void {
		this.agenda = this.agenda.filter(i => i !== item);
	}
}