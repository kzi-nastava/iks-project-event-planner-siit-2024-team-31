import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';

@Component({
  selector: 'app-service-card-edit',
  templateUrl: './service-card-edit.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ServiceCardEditComponent {
  @Input() service!: Product | Service;
  @Output() onEdit = new EventEmitter<Product | Service>();
  @Output() onDelete = new EventEmitter<Product | Service>();

  private defaultImageUrl = 'assets/images/default-service.svg';
  imageError = false;

  constructor(private router: Router) {}

  isService(item: Product | Service): item is Service {
    return item && 'serviceDurationMinMinutes' in item;
  }

  getImageUrl(): string {
    if (this.imageError) {
      return this.defaultImageUrl;
    }

    if (!this.service?.photos || this.service.photos.length === 0) {
      return this.defaultImageUrl;
    }

    return this.service.photos[0].tempPhotoUrl;
  }

  onImageError(event: any): void {
    this.imageError = true;
    event.target.src = this.defaultImageUrl;
  }

  formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) {
      return 'N/A';
    }
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
    }).format(price);
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) {
      return 'N/A';
    }
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    if (!this.service?.id) {
      console.error('Service ID is missing');
      return;
    }
    const isServiceType = this.isService(this.service);
    const editPath = isServiceType
      ? `/pup/edit-service/${this.service.id}`
      : `/pup/edit-product/${this.service.id}`;
    this.router.navigate([editPath]);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    if (!this.service) {
      console.error('Service is missing');
      return;
    }
    this.onDelete.emit(this.service);
  }

  onViewClick(): void {
    if (!this.service?.id) {
      console.error('Service ID is missing');
      return;
    }
    const isServiceType = this.isService(this.service);
    const viewPath = isServiceType
      ? `/service/${this.service.id}`
      : `/product/${this.service.id}`;
    this.router.navigate([viewPath]);
  }

  getSuitableEventTypesText(): string {
    if (
      !this.service?.suitableEventTypes ||
      this.service.suitableEventTypes.length === 0
    ) {
      return 'All events';
    }
    return this.service.suitableEventTypes
      .map((eventType) => eventType.name)
      .join(', ');
  }
}
