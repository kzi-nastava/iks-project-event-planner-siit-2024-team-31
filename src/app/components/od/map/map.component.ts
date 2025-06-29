import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MapService } from '../../../services/map/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FormsModule, NgIf],
})
export class MapComponent implements AfterViewInit, OnChanges {
  private map: any;
  private marker: any;

  @Input() viewMode: boolean = false; // If true, display coordinates only
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() address: string | null = null;

  searchQuery: string = '';
  selectedAddress: string = '';

  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null = null;

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Delay initialization to ensure Input properties are set
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.map &&
      (changes['latitude'] || changes['longitude']) &&
      this.latitude &&
      this.longitude
    ) {
      this.displayLocationOnMap();
    }
  }

  private initMap(): void {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // Use provided coordinates or default to Novi Sad
    const lat = this.latitude || 45.2396;
    const lng = this.longitude || 19.8227;

    try {
      this.map = L.map('map', {
        center: [lat, lng],
        zoom: this.viewMode ? 15 : 13,
      });

      const tiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          minZoom: 3,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      );
      tiles.addTo(this.map);

      // Force map to resize properly
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);

      if (this.viewMode && this.latitude && this.longitude) {
        this.displayLocationOnMap();
      } else if (!this.viewMode) {
        this.registerOnClick();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private displayLocationOnMap(): void {
    if (!this.latitude || !this.longitude) return;

    if (this.marker) {
      this.marker.setLatLng([this.latitude, this.longitude]);
    } else {
      this.marker = L.marker([this.latitude, this.longitude]).addTo(this.map);
    }

    if (this.address) {
      this.marker.bindPopup(this.address).openPopup();
    }

    this.map.setView([this.latitude, this.longitude], 15);
  }

  registerOnClick(): void {
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

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
            address: this.selectedAddress,
          };
        },
        error: (err: any) => {
          console.error('Error during reverse geocoding', err);
          this.selectedAddress = 'Error';
          this.selectedLocation = {
            lat,
            lng,
            address: this.selectedAddress,
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
            address: this.selectedAddress,
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
