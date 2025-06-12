import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product/products.service';
import { ServiceProduct } from '../../../types/models/service-product.model';
import { ServiceCardComponent } from '../../service-card/service-card.component';
import { ServiceFilterComponent } from '../../utils/service-filter/service-filter.component';

@Component({
  selector: 'app-service-product-list-filtered',
  imports: [
    FormsModule,
    CommonModule,
    ServiceFilterComponent,
    ServiceCardComponent,
  ],
  templateUrl: './service-list-filtered.component.html',
  standalone: true,
})
export class ServiceListFilteredComponent implements OnInit {
  services: ServiceProduct[] = [];
  filteredServices: ServiceProduct[] = [];
  paginatedServices: ServiceProduct[] = [];

  currentPage: number = 1;
  pageSize: number = 16; // 4x4 grid
  totalPages: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.productService.getAllServices().subscribe((services) => {
      this.services = services;
      this.filteredServices = [...this.services];
      this.calculatePagination();
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredServices.length / this.pageSize);
    this.changePage(1);
  }

  changePage(page: number) {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedServices = this.filteredServices.slice(startIndex, endIndex);
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
    this.filteredServices = this.services.filter((service) => {
      const matchesCategory =
        !filters.selectedCategories.length ||
        service.categories.some((category) =>
          filters.selectedCategories.includes(category)
        );

      const matchesCity =
        !filters.selectedCities.length ||
        filters.selectedCities.includes(service.pupInfo.city);

      const matchesAvailability =
        (!filters.fromDate ||
          new Date(service.availableFrom) >= new Date(filters.fromDate)) &&
        (!filters.toDate ||
          new Date(service.availableTo) <= new Date(filters.toDate));

      const matchesSuitability =
        !filters.selectedSuitability.length ||
        filters.selectedSuitability.includes(service.suitableFor);

      const matchesPrice =
        service.price >= filters.minPrice && service.price <= filters.maxPrice;

      return (
        matchesCategory &&
        matchesCity &&
        matchesAvailability &&
        matchesSuitability &&
        matchesPrice
      );
    });

    this.calculatePagination();
  }
}
