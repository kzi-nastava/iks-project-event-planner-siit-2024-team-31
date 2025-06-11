import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ServiceProductService } from '../../../services/service-products/service-products.service';
import { ServiceProduct } from '../../../types/models/service-product.model';

@Component({
  selector: 'app-pup-products-services-component',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './pup-products-services-component.component.html',
})
export class PupProductsServicesComponent implements OnInit {
  services: ServiceProduct[] = [];
  isLoading = false;

  constructor(private serviceProductService: ServiceProductService) {}

  ngOnInit(): void {
    this.loadUserServices();
  }

  private loadUserServices(): void {
    this.isLoading = true;
    this.serviceProductService.getMyServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      },
    });
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
