import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceProduct } from '../../models/service-product.model';
import { ServiceProductService } from '../../services/service-products/service-products.service';
import { ServiceCardComponent } from '../service-card/service-card.component';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, FormsModule],
})
export class ServiceListComponent implements OnInit {
  services: ServiceProduct[] = [];
  searchTerm: string = '';
  filteredServices: ServiceProduct[] = [];

  constructor(private serviceProductService: ServiceProductService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.serviceProductService
      .getAllServices('New York')
      .subscribe((services) => {
        this.services = services;
        this.applyFilter();
      });
  }

  applyFilter() {
    this.filteredServices = this.services.filter((service) =>
      service.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
