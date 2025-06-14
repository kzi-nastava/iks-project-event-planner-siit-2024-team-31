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

  isService(item: Product | Service): item is Service {
    return 'minTimeUsageHours' in item;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
