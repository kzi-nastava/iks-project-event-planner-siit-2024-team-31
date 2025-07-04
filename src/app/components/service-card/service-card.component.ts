import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Product } from '../../types/models/product.model';
import { Service } from '../../types/models/service.model';
import { Role } from '../../types/roles';
import { FavoriteButtonComponent } from '../all-users-components/favorite-button/favorite-button.component';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule, FavoriteButtonComponent],
})
export class ServiceCardComponent {
  @Input() service!: Product | Service;

  private defaultImageUrl = 'assets/images/default-service.svg';
  imageError = false;

  constructor(private authService: AuthService) {}

  get canFavorite(): boolean {
    return this.authService.getRole() === Role.ROLE_OD;
  }

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
}
