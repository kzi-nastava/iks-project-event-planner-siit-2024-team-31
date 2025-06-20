import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ServiceCardComponent } from '../../../components/service-card/service-card.component';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';
import { PaginatedResponse } from '../../../types/pagination.interface';

@Component({
  selector: 'app-pup-products-services-component',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ServiceCardComponent],
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
    private serviceService: ProvidedServiceService
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
    return items.filter((item) => item.isAvailable).length;
  }

  getTotalCount(): number {
    return this.totalElements;
  }

  getCurrentItems(): Product[] | Service[] {
    return this.showProducts ? this.products : this.services;
  }

  // Pagination helper methods
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }
}
