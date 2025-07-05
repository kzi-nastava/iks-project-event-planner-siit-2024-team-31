import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { NotificationService } from '../../../services/notification.service';
import { PhotoFile, PhotoService } from '../../../services/photo.service';
import { ProductService } from '../../../services/product/products.service';
import { EventType } from '../../../types/eventType';
import { Product } from '../../../types/models/product.model';
import { Page } from '../../../types/page';
import { ProductCategory } from '../../../types/productCategory';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EditProductComponent implements OnInit, OnDestroy {
  // ------------
  // Pagination for categories
  // ------------

  // ------------
  // Pagination for event types
  // ------------
  currentEventTypePage: number = 1;
  totalEventTypePages: number = 0;
  eventTypesPageSize: number = 5;
  paginatedEventTypes: EventType[] = [];
  eventTypesQuery: string = '';

  // Flags for modals
  showEventTypeModal = false;

  // ------------
  // Photo upload and preview
  // ------------
  photoPreviews: string[] = [];
  filesForUpload: File[] = [];
  existingImageUrls: string[] = [];

  // Product data
  productId: string = '';
  productData: Product = {
    id: '',
    pupId: '',
    name: '',
    description: '',
    peculiarities: '',
    category: {
      id: 0,
      name: '',
      description: '',
      status: {
        id: 0,
        version: 0,
        name: '',
        description: '',
      },
    },
    price: 0,
    discount: 0,
    available: true,
    photos: [],
    rating: 0,
    suitableEventTypes: [],
    status: {
      id: 0,
      version: 0,
      name: '',
      description: '',
    },
    visible: true,
  };

  private productService = inject(ProductService);
  private sanitizer = inject(DomSanitizer);
  private eventTypeService = inject(EventTypesService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private photoService = inject(PhotoService);

  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() productUpdated = new EventEmitter<void>();

  tempProduct: Product | null = null;
  removedPhotosIds: number[] = [];
  newPhotos: PhotoFile[] = [];

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    if (this.productId) {
      this.loadProduct();
    } else {
      this.notification.error('Product ID not found');
      this.router.navigate(['/pup/my-products-services']);
    }
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.photoService.cleanupPreviews(this.newPhotos);
  }

  initializeForm(): void {
    // Clean up any existing object URLs to prevent memory leaks
    this.photoPreviews.forEach((preview) => {
      if (typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });

    // Reset form state
    this.photoPreviews = [];
    this.filesForUpload = [];
    this.existingImageUrls = [];
    this.removedPhotosIds = [];
    this.newPhotos = [];

    // Initialize product data
    if (this.productData) {
      this.tempProduct = {
        ...this.productData,
        photos: this.productData.photos ? [...this.productData.photos] : [],
        suitableEventTypes: this.productData.suitableEventTypes
          ? [...this.productData.suitableEventTypes]
          : [],
      };
    }
  }

  private loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.productData = {
          ...product,
          photos: product.photos || [],
        };
        this.existingImageUrls =
          this.productData.photos.map((p) => p.tempPhotoUrl) || [];
        this.photoPreviews = [...this.existingImageUrls];
      },
      error: (error) => {
        this.notification.error('Failed to load product');
        console.error('Error loading product:', error);
        this.router.navigate(['/pup/my-products-services']);
      },
    });
  }

  // ---------------------------------
  // Methods for working with event types
  // ---------------------------------
  loadEventTypes(): void {
    this.eventTypeService
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
        error: (error: Error) => {
          console.error('Error loading event types:', error);
          this.notification.error('Failed to load event types');
        },
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
    if (!this.productData?.suitableEventTypes) return;

    const index = this.productData.suitableEventTypes.findIndex(
      (et) => et.id === eventType.id
    );
    if (index > -1) {
      this.productData.suitableEventTypes.splice(index, 1);
    } else {
      this.productData.suitableEventTypes.push(eventType);
    }
  }

  isEventTypeSelected(eventType: EventType): boolean {
    return (
      this.productData?.suitableEventTypes?.some(
        (et) => et.id === eventType.id
      ) || false
    );
  }

  removeSuitableEventType(eventType: EventType): void {
    if (!this.productData?.suitableEventTypes) return;

    const index = this.productData.suitableEventTypes.findIndex(
      (et) => et.id === eventType.id
    );
    if (index > -1) {
      this.productData.suitableEventTypes.splice(index, 1);
    }
  }

  confirmAddEventTypes(): void {
    this.showEventTypeModal = false;
  }

  // ---------------------------------
  // Methods for working with photos
  // ---------------------------------
  removePhoto(id: number): void {
    if (this.productData?.photos) {
      this.productData.photos = this.productData.photos.filter(
        (photo) => photo.photoId !== id
      );
      this.removedPhotosIds.push(id);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        this.filesForUpload.push(file);
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.photoPreviews.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  // ---------------------------------
  // Form submission
  // ---------------------------------
  onSubmit(): void {
    if (!this.productData) return;

    const formData = new FormData();

    // Add all product fields to formData with field name mapping
    Object.entries(this.productData).forEach(([key, value]) => {
      if (key === 'photos' || value === undefined || value === null) {
        return;
      }

      // Map field names for server compatibility
      let serverKey = key;
      if (key === 'available') {
        serverKey = 'isAvailable';
      } else if (key === 'visible') {
        serverKey = 'isVisible';
      }

      if (key === 'category' && value) {
        formData.append(serverKey, (value as ProductCategory).id.toString());
      } else if (key === 'suitableEventTypes' && Array.isArray(value)) {
        (value as EventType[]).forEach((eventType) => {
          formData.append('suitableEventTypes', eventType.id.toString());
        });
      } else if (typeof value === 'object') {
        formData.append(serverKey, JSON.stringify(value));
      } else {
        formData.append(serverKey, value.toString());
      }
    });

    // Add deleted photos IDs
    this.removedPhotosIds.forEach((id) => {
      formData.append('deletedPhotosIds', id.toString());
    });

    // Add new photos
    this.filesForUpload.forEach((file) => {
      formData.append('photos', file);
    });

    // Clean up any existing object URLs to prevent memory leaks
    this.photoPreviews.forEach((preview) => {
      if (typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });

    this.productService.updateProduct(this.productId, formData).subscribe({
      next: () => {
        this.notification.success('Product updated successfully!');
        this.cleanup();
        this.router.navigate(['/pup/my-products-services']);
      },
      error: (error: Error) => {
        console.error('Error updating product:', error);
        this.notification.error('Failed to update product. Please try again.');
      },
    });
  }

  // ---------------------------------
  // Utility methods
  // ---------------------------------
  Math = Math;

  onCancel(): void {
    // Clean up any object URLs before navigating away
    this.photoPreviews.forEach((preview) => {
      if (typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    });
    this.photoPreviews = [];
    this.filesForUpload = [];
    this.removedPhotosIds = [];
    this.newPhotos = [];

    this.router.navigate(['/pup/my-products-services']);
  }

  removePhotoPreview(index: number): void {
    if (index >= 0 && index < this.photoPreviews.length) {
      // Revoke the object URL to free memory
      const previewToRemove = this.photoPreviews[index];
      if (
        typeof previewToRemove === 'string' &&
        previewToRemove.startsWith('blob:')
      ) {
        URL.revokeObjectURL(previewToRemove);
      }
      this.photoPreviews.splice(index, 1);
      this.filesForUpload.splice(index, 1);
    }
  }
}
