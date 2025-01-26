import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
	selector: 'app-event-type-card',
	imports: [],
	templateUrl: './event-type-card.component.html',
})
export class EventTypeCardComponent {
	constructor(private router: Router) {
	}

	@Input() id!: number;
	@Input() name!: string;
	@Input() description!: string;

	navigateToEventTypePage() {
		this.router.navigate([`admin/event-types/${this.id}`]);
	}
}
