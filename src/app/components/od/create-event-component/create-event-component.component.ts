import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { EventService } from '../../../services/events/event.service';
import { NotificationService } from '../../../services/notification.service';
import { CreateEventResponse } from '../../../types/dto/responses/createEventResponse';
import { EventType } from '../../../types/eventType';
import { AgendaItem } from '../../../types/models/agendaItem.model';
import { Event } from '../../../types/models/event.model';
import { Page } from '../../../types/page';
import { AgendaCreationComponent } from '../agenda-creation/agenda-creation.component';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event-component.component.html',
  imports: [FormsModule, NgIf, NgForOf, AgendaCreationComponent, DatePipe],
})
export class CreateEventComponent {
  private eventTypesService = inject(EventTypesService);
  private eventService = inject(EventService);
  private notification = inject(NotificationService);

  eventData: Event = {
    id: '-1',
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    maxNumGuests: 0,
    isPrivate: false,
    status: '',
    organizer_id: '',
    eventType: {
      id: 0,
      name: '',
    },
    location: null,
    agenda: null,
    budget: null,
    photos: [],
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

  // New map properties
  mapSearchQuery: string = '';
  private locationMap: any;

  // Properties for working with event photos
  selectedPhoto: string | null = null;
  selectedFiles: File[] = [];
  // For UI preview during creation (base64 URLs)
  previewImages: string[] = [];

  // Logic to prevent accidental closing of modal windows
  private mouseDownOnBackground = false;

  constructor() {
    this.loadEventTypes();
  }

  ngOnInit(): void {
    this.eventData.startTime = new Date().toISOString().substring(0, 16);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.eventData.endTime = tomorrow.toISOString().substring(0, 16);
  }

  // EVENT TYPE METHODS
  openEventTypeSelection(): void {
    this.showEventTypeSelection = true;
  }

  closeEventTypeSelection(): void {
    this.showEventTypeSelection = false;
  }

  loadEventTypes(): void {
    this.eventTypesService
      .searchEventTypes(
        this.eventTypesQuery,
        this.currentEventTypePage,
        this.eventTypesPageSize
      )
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

  onSelectEventType(type: EventType): void {
    this.eventData.eventType = { ...type };
  }

  confirmEventTypeSelection(): void {
    this.showEventTypeSelection = false;
  }

  createNewEventType(): void {
    const newTypeName = this.eventTypesQuery.trim();
    if (newTypeName) {
      this.eventData.eventType = {
        id: 0, // Id for new event types
        name: newTypeName,
      };
      this.showEventTypeSelection = false;
    }
  }

  // AGENDA METHODS
  openAgendaCreation(): void {
    this.showAgendaCreation = true;
  }

  closeAgendaCreation(): void {
    this.showAgendaCreation = false;
  }

  handleAgendaData(agenda: AgendaItem[]) {
    this.eventData.agenda = agenda;
    this.closeAgendaCreation();
  }

  // BUDGET METHODS
  openBudgetCreation(): void {
    this.showBudgetCreation = true;
  }

  closeBudgetCreation(): void {
    this.showBudgetCreation = false;
  }

  getTotalBudget(): number {
    if (!this.eventData.budget || this.eventData.budget.length === 0) {
      return 0;
    }
    return this.eventData.budget.reduce((total, item) => total + item.cost, 0);
  }

  // MAP METHODS
  openMap(): void {
    this.showMap = true;
    this.mapSearchQuery = '';
    // Initialize map after DOM is rendered
    setTimeout(() => {
      this.initializeLocationMap();
    }, 100);
  }

  closeMap(): void {
    this.showMap = false;
    if (this.locationMap) {
      this.locationMap.remove();
      this.locationMap = null;
    }
  }

  private async initializeLocationMap(): Promise<void> {
    const L = (await import('leaflet')).default;

    // Set default icon
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    const mapContainer = document.getElementById('locationMap');
    if (!mapContainer) return;

    // Default to Novi Sad
    const defaultLat = this.selectedLocation?.lat || 45.2396;
    const defaultLng = this.selectedLocation?.lng || 19.8227;

    this.locationMap = L.map('locationMap').setView(
      [defaultLat, defaultLng],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.locationMap);

    // Add existing marker if location is selected
    if (this.selectedLocation) {
      L.marker([this.selectedLocation.lat, this.selectedLocation.lng])
        .addTo(this.locationMap)
        .bindPopup(this.selectedLocation.address);
    }

    // Handle map clicks
    this.locationMap.on('click', (e: any) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Resize map properly
    setTimeout(() => {
      if (this.locationMap) {
        this.locationMap.invalidateSize();
      }
    }, 200);
  }

  private async onMapClick(lat: number, lng: number): Promise<void> {
    const L = (await import('leaflet')).default;

    // Remove existing markers
    this.locationMap.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.locationMap.removeLayer(layer);
      }
    });

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(this.locationMap);

    // Reverse geocoding to get address
    this.reverseGeocode(lat, lng).then((address) => {
      this.selectedLocation = { lat, lng, address };
      marker.bindPopup(address).openPopup();
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  async searchLocation(): Promise<void> {
    if (!this.mapSearchQuery.trim()) {
      return;
    }

    // Import Leaflet for this method
    const L = (await import('leaflet')).default;

    const query = encodeURIComponent(this.mapSearchQuery);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          // Move map to the found location
          this.locationMap.setView([lat, lng], 15);

          // Remove existing markers
          this.locationMap.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              this.locationMap.removeLayer(layer);
            }
          });

          // Add marker
          const marker = L.marker([lat, lng]).addTo(this.locationMap);
          this.selectedLocation = { lat, lng, address: result.display_name };
          marker.bindPopup(result.display_name).openPopup();
        } else {
          this.notification.warning(
            'Location not found. Please try a different search term.'
          );
        }
      })
      .catch((error) => {
        console.error('Search failed:', error);
        this.notification.error('Search failed. Please try again.');
      });
  }

  confirmLocationSelection(): void {
    if (this.selectedLocation) {
      this.eventData.location = this.selectedLocation;
      this.closeMap();
    }
  }

  // Helper method to format address for UI display only (сокращенный формат)
  // Полный адрес сохраняется на сервер как this.selectedLocation.address
  getFormattedAddress(): string {
    if (!this.selectedLocation || !this.selectedLocation.address) {
      return 'No address selected';
    }

    const address = this.selectedLocation.address;

    // Try to parse and format the address components
    // Split by comma and clean up parts
    const parts = address
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length >= 5) {
      // Структура декодированного адреса:
      // parts[0] = номер дома
      // parts[1] = улица
      // parts[4] = город
      // parts[last] = страна
      const houseNumber = parts[0]; // номер дома
      const streetName = parts[1]; // улица
      const city = parts[4]; // город
      const country = parts[parts.length - 1]; // страна

      return `${streetName}, ${houseNumber}, ${city}, ${country}`;
    } else if (parts.length === 4) {
      // Если нет города на индексе 4, пробуем взять индекс 1 как город
      const houseNumber = parts[0]; // номер дома
      const streetName = parts[1]; // улица (или может быть город)
      const city = parts[2]; // возможный город
      const country = parts[parts.length - 1]; // страна

      return `${streetName}, ${houseNumber}, ${city}, ${country}`;
    } else if (parts.length === 3) {
      // Format: "Location, City, Country"
      const location = parts[0];
      const city = parts[1];
      const country = parts[2];

      return `${location}, ${city}, ${country}`;
    } else if (parts.length === 2) {
      // Format: "Location, Country"
      const location = parts[0];
      const country = parts[1];

      return `${location}, ${country}`;
    } else if (parts.length === 1) {
      // Single part - just return as is
      return parts[0];
    }

    // Fallback to original address if parsing fails
    return address;
  }

  // FORM SUBMISSION
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    // Basic event data
    formData.append('name', this.eventData.name);
    formData.append('description', this.eventData.description);
    formData.append('maxNumGuests', this.eventData.maxNumGuests.toString());
    formData.append(
      'startTime',
      this.convertToInstantFormat(this.eventData.startTime)
    );
    formData.append(
      'endTime',
      this.convertToInstantFormat(this.eventData.endTime)
    );
    formData.append('eventTypeName', this.eventData.eventType.name);
    formData.append('private', this.eventData.isPrivate.toString());

    // Location data
    if (this.eventData.location) {
      formData.append('location.lat', this.eventData.location.lat.toString());
      formData.append('location.lng', this.eventData.location.lng.toString());
      // Отправляем полный адрес на сервер
      formData.append('location.address', this.eventData.location.address);
    }

    // Budget items
    if (this.eventData.budget && this.eventData.budget.length > 0) {
      this.eventData.budget.forEach((item, index) => {
        formData.append(`budgetItems[${index}].itemName`, item.itemName);
        formData.append(`budgetItems[${index}].cost`, item.cost.toString());
        formData.append(`budgetItems[${index}].category`, item.category);
        formData.append(
          `budgetItems[${index}].isFixed`,
          item.isFixed.toString()
        );
      });
    }

    // Agenda items
    if (this.eventData.agenda && this.eventData.agenda.length > 0) {
      this.eventData.agenda.forEach((item, index) => {
        formData.append(
          `agendaItems[${index}].startDate`,
          this.convertToInstantFormat(item.startTime)
        );
        formData.append(
          `agendaItems[${index}].endDate`,
          this.convertToInstantFormat(item.endTime)
        );
        formData.append(`agendaItems[${index}].title`, item.title);
        formData.append(`agendaItems[${index}].description`, item.description);
        formData.append(`agendaItems[${index}].location`, item.location);
      });
    }

    // Photos - if we have files
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });
    }

    console.log('Creating event with FormData');
    // Log the contents of FormData for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    this.eventService.createEventWithFormData(formData).subscribe({
      next: (response: CreateEventResponse) => {
        console.log('Event created successfully:', response);
        this.notification.success('Event created successfully!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Error creating event:', err);
        this.notification.error('Error creating event. Please try again.');
      },
    });
  }

  /**
   * Converts datetime-local format to ISO 8601 format for java.time.Instant
   * @param dateTimeLocal - format: "2025-06-27T09:12"
   * @returns ISO 8601 format: "2025-06-27T09:12:00.000Z"
   */
  private convertToInstantFormat(dateTimeLocal: string): string {
    if (!dateTimeLocal) {
      return '';
    }

    // Add seconds if not present
    let isoString = dateTimeLocal;
    if (dateTimeLocal.length === 16) {
      isoString = dateTimeLocal + ':00';
    }

    // Create Date object and convert to ISO string with Z timezone
    const date = new Date(isoString);
    return date.toISOString();
  }

  private validateForm(): boolean {
    if (!this.eventData.name.trim()) {
      this.notification.validationError('Please enter an event name.');
      return false;
    }

    if (!this.eventData.description.trim()) {
      this.notification.validationError('Please enter an event description.');
      return false;
    }

    if (!this.eventData.eventType.name?.trim()) {
      this.notification.validationError(
        'Please select or enter an event type.'
      );
      return false;
    }

    if (!this.eventData.maxNumGuests || this.eventData.maxNumGuests < 1) {
      this.notification.validationError(
        'Please enter a valid number of maximum guests.'
      );
      return false;
    }

    if (!this.eventData.startTime) {
      this.notification.validationError('Please select a start date and time.');
      return false;
    }

    if (!this.eventData.endTime) {
      this.notification.validationError('Please select an end date and time.');
      return false;
    }

    if (
      new Date(this.eventData.startTime) >= new Date(this.eventData.endTime)
    ) {
      this.notification.validationError('End time must be after start time.');
      return false;
    }

    if (!this.eventData.location) {
      this.notification.validationError(
        'Please select a location for the event.'
      );
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.eventData = {
      id: '-1',
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      maxNumGuests: 0,
      isPrivate: false,
      status: '',
      organizer_id: '',
      eventType: {
        id: 0,
        name: '',
      },
      location: null,
      agenda: null,
      budget: null,
      photos: [],
    };
    this.selectedLocation = null;
    this.selectedFiles = [];
    this.previewImages = [];

    // Reset dates to default
    this.eventData.startTime = new Date().toISOString().substring(0, 16);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.eventData.endTime = tomorrow.toISOString().substring(0, 16);
  }

  // PHOTO METHODS
  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          // Сохраняем файл для FormData
          this.selectedFiles.push(file);
          // Также создаем preview для UI
          this.convertFileToBase64(file);
        }
      }
    }
  }

  private convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (!this.previewImages) {
        this.previewImages = [];
      }
      this.previewImages.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(index: number) {
    if (this.previewImages) {
      this.previewImages.splice(index, 1);
    }
    // Также удаляем из selectedFiles если индекс соответствует
    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }
  }

  openPhotoModal(photo: string) {
    this.selectedPhoto = photo;
  }

  closePhotoModal() {
    this.selectedPhoto = null;
  }

  // Методы для безопасного закрытия модальных окон
  onBackgroundMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.mouseDownOnBackground = true;
    }
  }

  onBackgroundMouseUp(event: MouseEvent) {
    if (event.target === event.currentTarget && this.mouseDownOnBackground) {
      // Определяем какое модальное окно закрыть
      if (this.showEventTypeSelection) {
        this.closeEventTypeSelection();
      } else if (this.showMap) {
        this.closeMap();
      } else if (this.showBudgetCreation) {
        this.closeBudgetCreation();
      } else if (this.selectedPhoto) {
        this.closePhotoModal();
      }
    }
    this.mouseDownOnBackground = false;
  }

  protected readonly Date = Date;

  getAgendaDuration(): string {
    if (!this.eventData.agenda || this.eventData.agenda.length === 0) {
      return '0 hours';
    }

    const totalDuration = this.eventData.agenda.reduce((total, item) => {
      const start = new Date(item.startTime).getTime();
      const end = new Date(item.endTime).getTime();
      return total + (end - start) / 1000 / 60 / 60;
    }, 0);

    return `${totalDuration.toFixed(2)} hours`;
  }
}
