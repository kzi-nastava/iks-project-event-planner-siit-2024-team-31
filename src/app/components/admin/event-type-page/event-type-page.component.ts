import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
	selector: 'app-event-type-page',
	templateUrl: './event-type-page.component.html',
})
export class EventTypePageComponent implements OnInit {
	id!: number;

	constructor(private route: ActivatedRoute) {
	}

	ngOnInit() {
		this.id = Number(this.route.snapshot.paramMap.get('id'));
	}
}
