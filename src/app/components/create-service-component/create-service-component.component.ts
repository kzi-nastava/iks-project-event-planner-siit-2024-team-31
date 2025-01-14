import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { EventService } from '../../services/events/event.service';
import { ServiceProductService } from '../../services/service-products/service-products.service';
import { CreateServiceRequest } from '../../types/dto/requests/createServiceRequest';
import { EventType } from '../../types/eventType'; // { id: number; name: string; }

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateServiceComponent {
  eventTypes$: Observable<EventType[]>;
  showEventTypeModal = false;
  selectedEventType: EventType | null = null;
  photoPreviews: string[] = [];

  serviceData = {
    name: '',
    description: '',
    peculiarities: '',
    price: 0,
    discount: 0,
    photos: [] as string[],
    // EventType: { id, name }
    suitableEventTypes: [] as EventType[],
    isVisible: false,
    isAvailable: false,
    serviceDurationMin: 0,
    serviceDurationMax: 0,
    bookingDeclineDeadline: 0,
    noTimeSelectionRequired: true,
    manualTimeSelection: false,
    bookingConfirmation: 'Manual' as 'Manual' | 'Auto',
  };

  constructor(
    public productService: ServiceProductService,
    public eventService: EventService
  ) {
    this.eventTypes$ = this.eventService.getEventTypes();
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result && typeof result === 'string') {
          this.photoPreviews.push(result);
          this.serviceData.photos.push(result);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePreview(index: number): void {
    this.photoPreviews.splice(index, 1);
    this.serviceData.photos.splice(index, 1);
  }
  openEventTypePopup(): void {
    this.showEventTypeModal = true;
    this.selectedEventType = null;
  }

  closeEventTypePopup(): void {
    this.showEventTypeModal = false;
  }

  confirmAddEventType(): void {
    if (this.selectedEventType) {
      this.serviceData.suitableEventTypes.push({ ...this.selectedEventType });
    }
    this.showEventTypeModal = false;
  }

  removeSuitableEventType(index: number): void {
    this.serviceData.suitableEventTypes.splice(index, 1);
  }

  get disableMinField(): boolean {
    return this.serviceData.noTimeSelectionRequired;
  }

  get disableMaxField(): boolean {
    return (
      this.serviceData.noTimeSelectionRequired ||
      !this.serviceData.manualTimeSelection
    );
  }

  get disableBookingDeadline(): boolean {
    return this.serviceData.noTimeSelectionRequired;
  }

  onNoTimeSelectionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    this.serviceData.noTimeSelectionRequired = isChecked;
    if (isChecked) {
      this.serviceData.serviceDurationMin = 0;
      this.serviceData.serviceDurationMax = 0;
      this.serviceData.bookingDeclineDeadline = 0;
      this.serviceData.manualTimeSelection = false;
    }
  }

  onManualTimeSelectionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    this.serviceData.manualTimeSelection = isChecked;
    if (!isChecked) {
      this.serviceData.serviceDurationMax = 0;
    }
  }

  onSubmit(): void {
    const request: CreateServiceRequest = {
      token: localStorage.getItem('token'),
      name: this.serviceData.name,
      description: this.serviceData.description,
      peculiarities: this.serviceData.peculiarities,
      price: this.serviceData.price,
      discount: this.serviceData.discount,
      photos: this.serviceData.photos,
      suitableEventTypes: this.serviceData.suitableEventTypes.map(
        (it) => it.id
      ),
      isVisible: this.serviceData.isVisible,
      isAvailable: this.serviceData.isAvailable,
      serviceDurationMin: this.serviceData.serviceDurationMin,
      serviceDurationMax: this.serviceData.serviceDurationMax,
      bookingDeclineDeadline: this.serviceData.bookingDeclineDeadline,
      noTimeSelectionRequired: this.serviceData.noTimeSelectionRequired,
      manualTimeSelection: this.serviceData.manualTimeSelection,
      bookingConfirmation: this.serviceData.bookingConfirmation,
    };

    this.productService.createNewService(request);
  }
}
