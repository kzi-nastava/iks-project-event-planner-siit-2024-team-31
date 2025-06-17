import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product/products.service';
import { ProvidedServiceService } from '../../services/provided-service/provided-service.service';
import { Product } from '../../types/models/product.model';
import { Service } from '../../types/models/service.model';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ServiceDetailComponent implements OnInit {
  item!: Service | Product;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private providedServiceService: ProvidedServiceService
  ) {}

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id')!;
    const itemType = this.route.snapshot.queryParamMap.get('type') || 'service';

    this.loadItem(itemId, itemType);
  }

  private loadItem(id: string, type: string): void {
    this.isLoading = true;
    this.error = '';

    if (type === 'product') {
      this.productService.getProductById(id).subscribe({
        next: (product) => {
          this.item = product;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Product not found';
          this.isLoading = false;
        },
      });
    } else {
      this.providedServiceService.getServiceById(id).subscribe({
        next: (service) => {
          this.item = service;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Service not found';
          this.isLoading = false;
        },
      });
    }
  }

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
