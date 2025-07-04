import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventTypesService } from '../../../services/event-types/event-types.service'; // Отдельный сервис для работы с типами событий
import { NotificationService } from '../../../services/notification.service';
import { ProductCategoriesService } from '../../../services/product-categories/product-categories.service';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceCategoriesService } from '../../../services/provided-service-categories/provided-service-categories.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { EventType } from '../../../types/eventType'; // { id: number; name: string; }
import { Page } from '../../../types/page';
import { ProductCategory } from '../../../types/productCategory';
import { ServiceCategory } from '../../../types/serviceCategory';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateServiceComponent implements OnInit {
  // ------------
  // Pagination for categories (server-side through ProductCategoriesService or ProvidedServiceCategoriesService)
  // ------------
  currentCategoryPage: number = 1;
  totalCategoryPages: number = 0;
  categoryPageSize: number = 10;
  paginatedProductCategories: ProductCategory[] = [];
  paginatedServiceCategories: ServiceCategory[] = [];
  searchQuery: string = '';

  // ------------
  // Pagination for event types (server-side through EventTypesService)
  // ------------
  currentEventTypePage: number = 1;
  totalEventTypePages: number = 0;
  eventTypesPageSize: number = 5;
  paginatedEventTypes: EventType[] = [];
  eventTypesQuery: string = '';

  //Flag for modals
  showCategoryModal = false;
  showEventTypeModal = false;

  // ------------
  // Photo upload and preview
  // ------------
  photoPreviews: string[] = [];
  filesForUpload: File[] = [];

  // Type selector
  isCreatingService = true; // true for service, false for product

  // Service data contains all the fields for the service
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

  private productService = inject(ProductService);
  private providedServiceService = inject(ProvidedServiceService);
  private productCategoryService = inject(ProductCategoriesService);
  private serviceCategoryService = inject(ProvidedServiceCategoriesService);
  private eventTypesService = inject(EventTypesService);
  public router = inject(Router); // Public for template access
  private notification = inject(NotificationService);

  constructor() {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadEventTypes();
  }

  // ---------------------------------
  // Methods for working with categories
  // ---------------------------------
  loadCategories(): void {
    if (this.isCreatingService) {
      // Load service categories
      this.serviceCategoryService
        .searchServiceCategories(
          this.searchQuery,
          this.currentCategoryPage,
          this.categoryPageSize
        )
        .subscribe({
          next: (page: Page<ServiceCategory>) => {
            this.paginatedServiceCategories = page.content;
            this.totalCategoryPages = page.totalPages;
          },
          error: (err) =>
            console.error('Error loading service categories:', err),
        });
    } else {
      // Load product categories
      this.productCategoryService
        .searchProductCategories(
          this.searchQuery,
          this.currentCategoryPage,
          this.categoryPageSize
        )
        .subscribe({
          next: (page: Page<ProductCategory>) => {
            this.paginatedProductCategories = page.content;
            this.totalCategoryPages = page.totalPages;
          },
          error: (err) =>
            console.error('Error loading product categories:', err),
        });
    }
  }

  onSearchQueryChange(): void {
    this.currentCategoryPage = 1;
    this.loadCategories();
  }

  previousCategoryPage(): void {
    if (this.currentCategoryPage > 1) {
      this.currentCategoryPage--;
      this.loadCategories();
    }
  }

  nextCategoryPage(): void {
    if (this.currentCategoryPage < this.totalCategoryPages) {
      this.currentCategoryPage++;
      this.loadCategories();
    }
  }

  openCategoryPopup(): void {
    this.showCategoryModal = true;
    this.searchQuery = '';
    this.currentCategoryPage = 1;
    this.loadCategories();
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

  // Getter for template to access the right categories array
  get currentCategories(): (ProductCategory | ServiceCategory)[] {
    return this.isCreatingService
      ? this.paginatedServiceCategories
      : this.paginatedProductCategories;
  }

  // ---------------------------------
  // Methods for working with event types
  // ---------------------------------
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

  openEventTypePopup(): void {
    this.showEventTypeModal = true;
    this.eventTypesQuery = '';
    this.currentEventTypePage = 1;
    this.loadEventTypes();
  }

  closeEventTypePopup(): void {
    this.showEventTypeModal = false;
  }

  toggleEventType(eventType: EventType): void {
    const index = this.serviceData.suitableEventTypes.findIndex(
      (et) => et.id === eventType.id
    );
    if (index > -1) {
      this.serviceData.suitableEventTypes.splice(index, 1);
    } else {
      this.serviceData.suitableEventTypes.push(eventType);
    }
  }

  isEventTypeSelected(eventType: EventType): boolean {
    return this.serviceData.suitableEventTypes.some(
      (et) => et.id === eventType.id
    );
  }

  // ---------------------------------
  // Photo upload methods
  // ---------------------------------
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.filesForUpload.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photoPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(index: number): void {
    this.photoPreviews.splice(index, 1);
    this.filesForUpload.splice(index, 1);
  }

  // ---------------------------------
  // Type switching
  // ---------------------------------
  toggleType(): void {
    this.isCreatingService = !this.isCreatingService;
    // Reset category when switching types
    this.serviceData.category = '';
    // Reload categories for the new type
    this.loadCategories();
  }

  // ---------------------------------
  // Form submission
  // ---------------------------------
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    // Add basic fields
    formData.append('name', this.serviceData.name);
    formData.append('category', this.serviceData.category);
    formData.append('description', this.serviceData.description);
    formData.append('peculiarities', this.serviceData.peculiarities);
    formData.append('price', this.serviceData.price.toString());
    formData.append('discount', this.serviceData.discount.toString());
    formData.append('isVisible', this.serviceData.isVisible.toString());
    formData.append('isAvailable', this.serviceData.isAvailable.toString());

    // Add suitable event types
    this.serviceData.suitableEventTypes.forEach((eventType) => {
      formData.append('suitableEventTypes', eventType.id.toString());
    });

    // Add photos
    this.filesForUpload.forEach((file, index) => {
      formData.append(`photos`, file);
    });

    // Add service-specific fields only if creating a service
    if (this.isCreatingService) {
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
        this.serviceData.noTimeSelectionRequired.toString()
      );
      formData.append(
        'manualTimeSelection',
        this.serviceData.manualTimeSelection.toString()
      );
      formData.append(
        'bookingConfirmation',
        this.serviceData.bookingConfirmation
      );
    }

    // Submit to appropriate service
    const submitObservable = this.isCreatingService
      ? this.providedServiceService.createNewService(formData)
      : this.productService.createNewProduct(formData);

    submitObservable.subscribe({
      next: (response) => {
        console.log(
          `${
            this.isCreatingService ? 'Service' : 'Product'
          } created successfully:`,
          response
        );
        this.notification.success(
          `${
            this.isCreatingService ? 'Service' : 'Product'
          } created successfully!`
        );
        this.router.navigate(['/pup/my-products-services']);
      },
      error: (error) => {
        console.error(
          `Error creating ${this.isCreatingService ? 'service' : 'product'}:`,
          error
        );
        let errorMessage = `Error creating ${
          this.isCreatingService ? 'service' : 'product'
        }`;

        if (error.status === 400) {
          errorMessage = 'Invalid data provided. Please check all fields.';
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create this item.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.notification.error(errorMessage);
      },
    });
  }

  private validateForm(): boolean {
    if (!this.serviceData.name.trim()) {
      this.notification.validationError('Please enter a name');
      return false;
    }
    if (!this.serviceData.category.trim()) {
      this.notification.validationError('Please select a category');
      return false;
    }
    if (this.serviceData.price <= 0) {
      this.notification.validationError('Please enter a valid price');
      return false;
    }
    if (!this.serviceData.description.trim()) {
      this.notification.validationError('Please enter a description');
      return false;
    }
    if (this.serviceData.suitableEventTypes.length === 0) {
      this.notification.validationError(
        'Please select at least one suitable event type'
      );
      return false;
    }
    if (this.serviceData.discount < 0 || this.serviceData.discount > 100) {
      this.notification.validationError('Discount must be between 0 and 100');
      return false;
    }

    // Service-specific validation
    if (this.isCreatingService) {
      if (!this.serviceData.noTimeSelectionRequired) {
        if (this.serviceData.serviceDurationMin <= 0) {
          this.notification.validationError(
            'Service duration minimum must be greater than 0'
          );
          return false;
        }
        if (
          this.serviceData.serviceDurationMax > 0 &&
          this.serviceData.serviceDurationMax <
            this.serviceData.serviceDurationMin
        ) {
          this.notification.validationError(
            'Service duration maximum must be greater than minimum'
          );
          return false;
        }
        if (this.serviceData.bookingDeclineDeadline < 0) {
          this.notification.validationError(
            'Booking decline deadline must be 0 or greater'
          );
          return false;
        }
      }
    }

    return true;
  }

  // ---------------------------------
  // Missing methods for template compatibility
  // ---------------------------------
  removeSuitableEventType(index: number): void {
    this.serviceData.suitableEventTypes.splice(index, 1);
  }

  // This method is used by the modal checkbox interactions
  toggleEventTypeSelection(type: EventType, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.isEventTypeSelected(type)) {
        this.serviceData.suitableEventTypes.push({ ...type });
      }
    } else {
      this.serviceData.suitableEventTypes =
        this.serviceData.suitableEventTypes.filter((et) => et.id !== type.id);
    }
  }

  confirmAddEventTypes(): void {
    this.showEventTypeModal = false;
  }

  // Service time management getters and methods
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

  // Form progress calculation
  getFormProgress(): number {
    let progress = 0;
    const totalFields = 5; // name, category, price, description, photos

    if (this.serviceData.name?.trim()) progress++;
    if (this.serviceData.category?.trim()) progress++;
    if (this.serviceData.price && this.serviceData.price > 0) progress++;
    if (this.serviceData.description?.trim()) progress++;
    if (this.photoPreviews.length > 0) progress++;

    return Math.round((progress / totalFields) * 100);
  }
}
