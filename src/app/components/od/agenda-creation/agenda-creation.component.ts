import {Component, Input} from '@angular/core';
import {AgendaItem} from "../../../types/models/agendaItem.model";
import {FormsModule} from "@angular/forms";

@Component({
	selector: 'app-agenda-creation',
	imports: [
		FormsModule
	],
	templateUrl: './agenda-creation.component.html',
	styleUrl: './agenda-creation.component.scss'
})
export class AgendaCreationComponent {

	@Input() startDate: string = '';
	@Input() endDate: string = '';

	currentAgendaItem: AgendaItem = {
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		location: ''
	}

	agenda: AgendaItem[] = [];

	addNewAgendaItem() {

	}

	createAgenda() {

	}

}
