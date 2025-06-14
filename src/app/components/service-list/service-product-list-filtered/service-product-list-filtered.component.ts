import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    this.providedServiceService.getTopServices().subscribe((services) => {
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
      const matchesCategory =
        !filters.selectedCategories.length ||
        item.categories.some((category: string) =>
          filters.selectedCategories.includes(category)
        );

      const matchesPrice =
        item.price >= filters.minPrice && item.price <= filters.maxPrice;

      const matchesSuitability =
        !filters.selectedSuitability.length ||
        item.suitableFor.some((suitable: string) =>
          filters.selectedSuitability.includes(suitable)
        );

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
