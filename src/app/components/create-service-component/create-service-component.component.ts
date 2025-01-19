import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { EventService } from '../../services/events/event.service';
import { ServiceProductService } from '../../services/service-products/service-products.service';
import { EventType } from '../../types/eventType'; // { id: number; name: string; }
import { ProductCategory } from '../../types/productCategory';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateServiceComponent implements OnInit {
  categories$: Observable<ProductCategory[]>;
  eventTypes$: Observable<EventType[]>;

  allEventTypes: EventType[] = [];

  showCategoryModal = false;
  filteredCategories: string[] = [];
  searchQuery = '';
  showEventTypeModal = false;
  selectedEventType: EventType | null = null;

  categories: string[] = [];

  photoPreviews: string[] = [];
  filesForUpload: File[] = [];

  serviceData = {
    name: '',
    description: '',
    peculiarities: '',
    category: '',
    price: 0,
    discount: 0,
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
    this.categories$ = this.productService.getServiceCategories();
    this.eventTypes$ = this.eventService.getEventTypes();
  }

  ngOnInit(): void {
    this.categories$.subscribe({
      next: (allCats) => {
        if (allCats) {
          this.categories = allCats.map((cat) => cat.name);
        } else {
          console.error('No categories received from the server');
          this.categories = [];
        }
        this.filterCategories();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
        this.filterCategories();
      },
    });

    this.eventTypes$.subscribe({
      next: (allTypes) => {
        if (allTypes) {
          this.allEventTypes = allTypes;
          console.log('Loaded event types:', this.allEventTypes);
        } else {
          console.error('No event types received from the server');
          this.allEventTypes = [];
        }
      },
      error: (err) => {
        console.error('Error loading event types:', err);
        this.allEventTypes = [];
      },
    });
  }

  // --------------------------------
  // Category Management
  // --------------------------------
  filterCategories(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCategories = this.categories.filter((cat) =>
      cat.toLowerCase().includes(q)
    );
  }

  onSearchQueryChange(): void {
    this.filterCategories();
  }

  openCategoryPopup(): void {
    this.showCategoryModal = true;
    this.searchQuery = '';
    this.filterCategories();
  }

  closeCategoryPopup(): void {
    this.showCategoryModal = false;
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
      this.filesForUpload.push(file);

      // Base64 preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result && typeof result === 'string') {
          this.photoPreviews.push(result);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePreview(index: number): void {
    this.photoPreviews.splice(index, 1);
    this.filesForUpload.splice(index, 1);
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
      const exists = this.serviceData.suitableEventTypes.some(
        (et) => et.id === this.selectedEventType!.id
      );
      if (!exists) {
        // Добавляем в выбранные
        this.serviceData.suitableEventTypes.push({ ...this.selectedEventType });
        // Убираем его из общего списка, чтобы не добавлять повторно
        this.allEventTypes = this.allEventTypes.filter(
          (et) => et.id !== this.selectedEventType!.id
        );
      }
    }
    this.selectedEventType = null;
    this.showEventTypeModal = false;
  }

  removeSuitableEventType(index: number): void {
    const removedType = this.serviceData.suitableEventTypes[index];

    this.serviceData.suitableEventTypes.splice(index, 1);

    this.allEventTypes.push(removedType);
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
  // SUBMIT
  // --------------------------------
  onSubmit(): void {
    console.log('Form submitted!', this.serviceData);

    const formData = new FormData();

    formData.append('name', this.serviceData.name);
    formData.append('category', this.serviceData.category);
    formData.append('description', this.serviceData.description);
    formData.append('peculiarities', this.serviceData.peculiarities);
    formData.append('price', this.serviceData.price.toString());
    formData.append('discount', this.serviceData.discount.toString());

    this.serviceData.suitableEventTypes.forEach((et) => {
      formData.append('suitableEventTypes', et.id.toString());
    });

    formData.append('isVisible', this.serviceData.isVisible ? 'true' : 'false');
    formData.append(
      'isAvailable',
      this.serviceData.isAvailable ? 'true' : 'false'
    );
    formData.append(
      'serviceDurationMin',
      this.serviceData.serviceDurationMin.toString()
    );
    formData.append(
      'serviceDurationMax',
      this.serviceData.serviceDurationMax.toString()
    );
    formData.append(
      'bookingDeclineDeadline',
      this.serviceData.bookingDeclineDeadline.toString()
    );
    formData.append(
      'noTimeSelectionRequired',
      this.serviceData.noTimeSelectionRequired ? 'true' : 'false'
    );
    formData.append(
      'manualTimeSelection',
      this.serviceData.manualTimeSelection ? 'true' : 'false'
    );
    formData.append(
      'bookingConfirmation',
      this.serviceData.bookingConfirmation
    );

    this.filesForUpload.forEach((file) => {
      formData.append('photos', file);
    });

    this.productService.createNewService(formData).subscribe({
      next: (response) => console.log('Success:', response),
      error: (err) => console.error('Error:', err),
    });
  }
}
