import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';
import { PaginatedResponse } from '../../../types/pagination.interface';
import { ServiceCardEditComponent } from '../service-card-edit/service-card-edit.component';

@Component({
  selector: 'app-pup-products-services-component',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ServiceCardEditComponent],
  templateUrl: './pup-products-services-component.component.html',
})
export class PupProductsServicesComponent implements OnInit {
  products: Product[] = [];
  services: Service[] = [];
  isLoading = false;
  showProducts = true; // true for products, false for services

  // Pagination properties
  currentPage = 0;
  pageSize = 8;
  totalElements = 0;
  totalPages = 0;

  // Search functionality
  searchTerm = '';
  searchTimeout: any;

  // Make Math available in template
  Math = Math;

  constructor(
    private productService: ProductService,
    private serviceService: ProvidedServiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  switchToProducts(): void {
    if (!this.showProducts) {
      this.showProducts = true;
      this.resetPagination();
      this.loadData();
    }
  }

  switchToServices(): void {
    if (this.showProducts) {
      this.showProducts = false;
      this.resetPagination();
      this.loadData();
    }
  }

  resetPagination(): void {
    this.currentPage = 0;
    this.searchTerm = '';
  }

  loadData(): void {
    if (this.showProducts) {
      this.loadProducts();
    } else {
      this.loadServices();
    }
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService
      .getMyProductsPage(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          this.products = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.products = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.isLoading = false;
        },
      });
  }

  private loadServices(): void {
    this.isLoading = true;
    this.serviceService
      .getMyServicesPage(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (response: PaginatedResponse<Service>) => {
          this.services = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.services = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.isLoading = false;
        },
      });
  }

  // Search functionality
  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0; // Reset to first page when searching
      this.loadData();
    }, 500); // 500ms delay for better UX
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadData();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadData();
    }
  }

  // Utility methods
  getAverageRating(): number {
    const items = this.showProducts ? this.products : this.services;
    if (items.length === 0) return 0;

    const totalRating = items.reduce(
      (sum, item) => sum + (item.rating || 0),
      0
    );
    return Math.round((totalRating / items.length) * 10) / 10;
  }

  getAvailableCount(): number {
    const items = this.showProducts ? this.products : this.services;
    return items.filter((item) => item.available).length;
  }

  getTotalCount(): number {
    return this.totalElements;
  }

  getCurrentItems(): Product[] | Service[] {
    return this.showProducts ? this.products : this.services;
  }

  onDeleteItem(item: Product | Service): void {
    const itemType = this.isService(item) ? 'service' : 'product';
    const confirmed = confirm(
      `Are you sure you want to delete this ${itemType}?`
    );

    if (!confirmed) {
      return;
    }

    if (this.isService(item)) {
      this.serviceService.deleteService(item.id).subscribe({
        next: () => {
          this.notificationService.success('Service deleted successfully');
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting service:', error);
          this.notificationService.error('Error deleting service');
        },
      });
    } else {
      this.productService.deleteProduct(item.id).subscribe({
        next: () => {
          this.notificationService.success('Product deleted successfully');
          this.loadData();
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          this.notificationService.error('Error deleting product');
        },
      });
    }
  }

  private isService(item: Product | Service): item is Service {
    return 'serviceDurationMinMinutes' in item;
  }

  // Pagination helper methods

  hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  getPageNumbers(): number[] {
    const maxPagesToShow = 5;
    const startPage = Math.max(
      0,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    const endPage = Math.min(
      this.totalPages - 1,
      startPage + maxPagesToShow - 1
    );

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
