import {AfterViewInit, Component} from '@angular/core';
import * as L from 'leaflet';
import {MapService} from '../../../services/map/map.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	imports: [FormsModule, NgIf],
})
export class MapComponent implements AfterViewInit {
	private map: any;
	private marker: any;

	searchQuery: string = '';
	selectedAddress: string = '';

	selectedLocation: {
		lat: number;
		lng: number;
		address: string
	} | null = null;

	constructor(private mapService: MapService) {
	}

	ngAfterViewInit(): void {
		const DefaultIcon = L.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
		});
		L.Marker.prototype.options.icon = DefaultIcon;
		this.initMap();
	}

	private initMap(): void {
		this.map = L.map('map', {
			center: [45.2396, 19.8227],
			zoom: 13,
		});

		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			minZoom: 3,
			attribution:
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		});
		tiles.addTo(this.map);

		this.registerOnClick();
	}

	registerOnClick(): void {
		this.map.on('click', (e: any) => {
			const {lat, lng} = e.latlng;

			if (this.marker) {
				this.marker.setLatLng(e.latlng);
			} else {
				this.marker = L.marker([lat, lng]).addTo(this.map);
			}

			this.mapService.reverseSearch(lat, lng).subscribe({
				next: (res: any) => {
					this.selectedAddress = res.display_name || 'Address not found';
					this.selectedLocation = {
						lat,
						lng,
						address: this.selectedAddress
					};
				},
				error: (err: any) => {
					console.error('Error during reverse geocoding', err);
					this.selectedAddress = 'Error';
					this.selectedLocation = {
						lat,
						lng,
						address: this.selectedAddress
					};
				},
			});
		});
	}

	onSearch(event: Event): void {
		event.preventDefault();
		if (!this.searchQuery.trim()) {
			return;
		}
		this.mapService.search(this.searchQuery.trim()).subscribe({
			next: (result: any) => {
				if (result && result.length) {
					const lat = result[0].lat;
					const lng = result[0].lon;
					if (this.marker) {
						this.marker.setLatLng([lat, lng]);
					} else {
						this.marker = L.marker([lat, lng]).addTo(this.map);
					}
					this.map.setView([lat, lng], 15);

					this.selectedAddress = result[0].display_name || this.searchQuery;
					this.selectedLocation = {
						lat,
						lng,
						address: this.selectedAddress
					};
				} else {
					console.log('Address not found');
				}
			},
			error: (err: any) => {
				console.error('Error searching address', err);
			},
		});
	}
}