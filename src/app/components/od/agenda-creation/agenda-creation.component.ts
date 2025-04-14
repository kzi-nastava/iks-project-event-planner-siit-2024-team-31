import {Component} from '@angular/core';
import {AgendaItem} from "../../../types/models/agendaItem.model";

@Component({
	selector: 'app-agenda-creation',
	imports: [],
	templateUrl: './agenda-creation.component.html',
	styleUrl: './agenda-creation.component.scss'
})
export class AgendaCreationComponent {

	agenda: AgendaItem[] = [];

}
