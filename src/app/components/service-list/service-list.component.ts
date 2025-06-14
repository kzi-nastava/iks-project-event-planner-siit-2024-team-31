import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProvidedServiceService } from '../../services/provided-service/provided-service.service';
import { Service } from '../../types/models/service.model';
import { ServiceCardComponent } from '../service-card/service-card.component';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, FormsModule],
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  searchTerm: string = '';
  filteredServices: Service[] = [];
  paginatedServices: Service[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6; // Number of items per page
  totalPages: number = 1;

  constructor(private providedServiceService: ProvidedServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.providedServiceService.getMyServices().subscribe((services) => {
      this.services = services;
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
    this.changePage(1); // Reset to the first page after filtering
  }

  changePage(page: number) {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedServices = this.filteredServices.slice(startIndex, endIndex);
  }
}
