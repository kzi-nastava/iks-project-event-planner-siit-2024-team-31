import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class CreateServiceComponent implements OnInit {
  eventTypes$: Observable<EventType[]>;
  categories$: Observable<string[]>;

  showCategoryModal = false;
  categories: string[] = [];
  filteredCategories: string[] = [];
  searchQuery = '';

  showEventTypeModal = false;
  selectedEventType: EventType | null = null;

  photoPreviews: string[] = [];

  serviceData = {
    name: '',
    description: '',
    peculiarities: '',
    category: '',
    price: 0,
    discount: 0,
    photos: [] as string[],
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
    this.categories$ = this.productService.getServiceCategories();
  }

  ngOnInit(): void {
    this.categories$.subscribe((allCats) => {
      this.categories = allCats;
      this.filterCategories();
    });
  }

  // --------------------------------
  // Category Management
  // --------------------------------
  openCategoryPopup(): void {
    this.showCategoryModal = true;
    this.searchQuery = '';
    this.filterCategories();
  }

  closeCategoryPopup(): void {
    this.showCategoryModal = false;
  }

  onSearchQueryChange(): void {
    this.filterCategories();
  }

  filterCategories(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCategories = this.categories.filter((cat) =>
      cat.toLowerCase().includes(q)
    );
  }

  selectCategory(cat: string): void {
    this.serviceData.category = cat;
    this.closeCategoryPopup();
  }

  createNewCategory(): void {
    const newCat = this.searchQuery.trim();
    if (newCat) {
      this.serviceData.category = newCat;
      this.closeCategoryPopup();
    }
  }

  // --------------------------------
  // Photos Management
  // --------------------------------
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

  // --------------------------------
  // Event Type Management
  // --------------------------------
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

  // --------------------------------
  // Time Management
  // --------------------------------
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

  // --------------------------------
  // Submit
  // --------------------------------
  onSubmit(): void {
    const request: CreateServiceRequest = {
      token: localStorage.getItem('token'),
      name: this.serviceData.name,
      category: this.serviceData.category,
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
