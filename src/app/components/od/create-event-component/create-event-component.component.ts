import {Component, ViewChild} from '@angular/core';
import {MapComponent} from '../../utils/map/map.component';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
	selector: 'app-create-event',
	templateUrl: './create-event-component.component.html',
	imports: [
		MapComponent,
		FormsModule,
		NgIf
	]
})
export class CreateEventComponent {
	showMap: boolean = false;
	selectedLocation: {
		lat: number;
		lng: number;
		address: string
	} | null = null;

	@ViewChild(MapComponent)
	mapComponent!: MapComponent;

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

	}
}