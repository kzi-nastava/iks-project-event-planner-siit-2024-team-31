import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';

@Component({
  selector: 'app-pup-products-services-component',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './pup-products-services-component.component.html',
})
export class PupProductsServicesComponent implements OnInit {
  products: Product[] = [];
  services: Service[] = [];
  isLoading = false;
  showProducts = true; // true for products, false for services

  constructor(
    private productService: ProductService,
    private serviceService: ProvidedServiceService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  toggleView(): void {
    this.showProducts = !this.showProducts;
    this.loadData();
  }

  private loadData(): void {
    if (this.showProducts) {
      this.loadProducts();
    } else {
      this.loadServices();
    }
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService.getMyProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      },
    });
  }

  private loadServices(): void {
    this.isLoading = true;
    this.serviceService.getMyServices().subscribe({
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
