import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { NotificationService } from '../../../services/notification.service';
import { PhotoFile, PhotoService } from '../../../services/photo.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { EventType } from '../../../types/eventType';
import { Service } from '../../../types/models/service.model';
import { Page } from '../../../types/page';

@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EditServiceComponent implements OnInit, OnDestroy {
  private serviceService = inject(ProvidedServiceService);
  private eventTypeService = inject(EventTypesService);
  private sanitizer = inject(DomSanitizer);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private photoService = inject(PhotoService);

  // Service data
  serviceId: string = '';
  serviceData: Service | null = null;

  // Photo management
  removedPhotosIds: number[] = [];
  newPhotos: PhotoFile[] = [];
  photoPreviews: string[] = [];
  filesForUpload: File[] = [];
  existingImageUrls: string[] = [];

  // Event type management
  currentEventTypePage: number = 1;
  totalEventTypePages: number = 0;
  eventTypesPageSize: number = 5;
  paginatedEventTypes: EventType[] = [];
  eventTypesQuery: string = '';
  showEventTypeModal = false;

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';
    if (this.serviceId) {
      this.loadServiceData();
    } else {
      this.notification.error('Service ID not found');
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
  }

  loadServiceData(): void {
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (service: Service) => {
        this.serviceData = {
          ...service,
          photos: service.photos || [],
          available: service.available !== undefined ? service.available : true,
          visible: service.visible !== undefined ? service.visible : true,
        };
        this.existingImageUrls =
          this.serviceData.photos.map((p) => p.tempPhotoUrl) || [];
        this.photoPreviews = [...this.existingImageUrls];
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.notification.error('Error loading service data');
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
    if (!this.serviceData?.suitableEventTypes) return;

    const index = this.serviceData.suitableEventTypes.findIndex(
      (et: EventType) => et.id === eventType.id
    );
    if (index > -1) {
      this.serviceData.suitableEventTypes.splice(index, 1);
    } else {
      this.serviceData.suitableEventTypes.push(eventType);
    }
  }

  isEventTypeSelected(eventType: EventType): boolean {
    return (
      this.serviceData?.suitableEventTypes?.some(
        (et: EventType) => et.id === eventType.id
      ) || false
    );
  }

  removeSuitableEventType(eventType: EventType): void {
    if (!this.serviceData?.suitableEventTypes) return;

    const index = this.serviceData.suitableEventTypes.findIndex(
      (et: EventType) => et.id === eventType.id
    );
    if (index > -1) {
      this.serviceData.suitableEventTypes.splice(index, 1);
    }
  }

  confirmAddEventTypes(): void {
    this.showEventTypeModal = false;
  }

  // ---------------------------------
  // Methods for working with photos
  // ---------------------------------
  removePhoto(id: number): void {
    if (this.serviceData?.photos) {
      this.serviceData.photos = this.serviceData.photos.filter(
        (photo: any) => photo.photoId !== id
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

  // ---------------------------------
  // Form submission
  // ---------------------------------
  onSubmit(): void {
    if (!this.serviceData) return;

    const formData = new FormData();

    // Add all service fields to formData with field name mapping
    Object.entries(this.serviceData).forEach(([key, value]) => {
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

      if (
        key === 'category' &&
        value &&
        typeof value === 'object' &&
        'id' in value
      ) {
        formData.append(serverKey, (value as any).id.toString());
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

    this.serviceService.updateService(this.serviceId, formData).subscribe({
      next: () => {
        this.notification.success('Service updated successfully!');
        this.cleanup();
        this.router.navigate(['/pup/my-products-services']);
      },
      error: (error: Error) => {
        console.error('Error updating service:', error);
        this.notification.error('Failed to update service. Please try again.');
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
}
