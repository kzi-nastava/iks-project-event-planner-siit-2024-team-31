import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product/products.service';
import { ProvidedServiceService } from '../../services/provided-service/provided-service.service';
import { Product } from '../../types/models/product.model';
import { Service } from '../../types/models/service.model';
import { ServiceCardComponent } from '../service-card/service-card.component';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, FormsModule],
})
export class ServiceListComponent implements OnInit {
  services: (Product | Service)[] = [];
  searchTerm: string = '';
  filteredServices: (Product | Service)[] = [];
  paginatedServices: (Product | Service)[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
    private serviceService: ProvidedServiceService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    // Load both services and products
    const services$ = this.serviceService.getAllServices();
    const products$ = this.productService.getAllProducts();

    services$.subscribe((services) => {
      this.services = [...this.services, ...services];
      this.applyFilter();
    });

    products$.subscribe((products) => {
      this.services = [...this.services, ...products];
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filteredServices = this.services.filter((service) =>
      service.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.calculatePagination();
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
}
