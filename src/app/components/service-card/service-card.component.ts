import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../types/models/product.model';
import { Service } from '../../types/models/service.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class ServiceCardComponent {
  @Input() service!: Product | Service;

  private defaultImageUrl = 'assets/images/default-service.svg';
  imageError = false;

  isService(item: Product | Service): item is Service {
    return 'serviceDurationMinMinutes' in item;
  }

  getImageUrl(): string {
    if (this.imageError) {
      return this.defaultImageUrl;
    }

    if (!this.service.imageUrls || this.service.imageUrls.length === 0) {
      return this.defaultImageUrl;
    }

    return this.service.imageUrls[0];
  }

  onImageError(event: any): void {
    this.imageError = true;
    event.target.src = this.defaultImageUrl;
  }

  formatPrice(price: number): string {
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
}
