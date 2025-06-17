import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';
import { ServiceCardComponent } from '../../service-card/service-card.component';
import { ServiceFilterComponent } from '../../utils/service-filter/service-filter.component';

@Component({
  selector: 'app-service-product-list-filtered',
  templateUrl: './service-product-list-filtered.component.html',
  imports: [
    FormsModule,
    CommonModule,
    ServiceFilterComponent,
    ServiceCardComponent,
  ],
  standalone: true,
})
export class ServiceProductListFilteredComponent implements OnInit {
  @ViewChild(ServiceFilterComponent) filterComponent!: ServiceFilterComponent;

  products: Product[] = [];
  services: Service[] = [];
  filteredItems: (Product | Service)[] = [];
  paginatedItems: (Product | Service)[] = [];

  currentPage: number = 1;
  pageSize: number = 16; // 4x4 grid
  totalPages: number = 0;

  showProducts: boolean = true; // true for products, false for services

  constructor(
    private productService: ProductService,
    private providedServiceService: ProvidedServiceService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  toggleView(): void {
    this.showProducts = !this.showProducts;
    // Notify the filter component about the type change
    if (this.filterComponent) {
      this.filterComponent.onTypeChange(this.showProducts);
    }
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
    this.productService.getAllProducts().subscribe((products) => {
      this.products = products;
      this.filteredItems = [...this.products];
      this.calculatePagination();
    });
  }

  private loadServices(): void {
    this.providedServiceService.getAllServices().subscribe((services) => {
      this.services = services;
      this.filteredItems = [...this.services];
      this.calculatePagination();
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredItems.length / this.pageSize);
    this.changePage(1);
  }

  changePage(page: number) {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedItems = this.filteredItems.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.changePage(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.changePage(this.currentPage - 1);
    }
  }

  applyFilters(filters: any) {
    const sourceItems = this.showProducts ? this.products : this.services;

    this.filteredItems = sourceItems.filter((item) => {
      let matchesCategory = true;
      let matchesSuitability = true;

      // Handle categories differently for products vs services
      if (filters.selectedCategories.length > 0) {
        if (this.showProducts) {
          // For products: category is a single ProductCategory object
          const product = item as Product;
          matchesCategory =
            product.category &&
            filters.selectedCategories.includes(product.category.name);
        } else {
          // For services: category is a single ServiceCategory object
          const service = item as Service;
          matchesCategory =
            service.category &&
            filters.selectedCategories.includes(service.category.name);
        }
      }

      const matchesPrice =
        item.price >= filters.minPrice && item.price <= filters.maxPrice;

      // Handle suitableFor
      if (filters.selectedSuitability.length > 0) {
        matchesSuitability =
          item.suitableFor?.some((suitable: string) =>
            filters.selectedSuitability.includes(suitable)
          ) || false;
      }

      // For services, check additional fields
      if (!this.showProducts && 'availableFrom' in item) {
        const service = item as Service;
        const matchesAvailability =
          (!filters.fromDate ||
            new Date(service.availableFrom) >= new Date(filters.fromDate)) &&
          (!filters.toDate ||
            new Date(service.availableTo) <= new Date(filters.toDate));

        return (
          matchesCategory &&
          matchesPrice &&
          matchesSuitability &&
          matchesAvailability
        );
      }

      return matchesCategory && matchesPrice && matchesSuitability;
    });

    this.calculatePagination();
  }
}
