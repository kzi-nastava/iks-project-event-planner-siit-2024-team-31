import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceProductService } from '../../services/service-products/service-products.service';
import { ServiceProduct } from '../../types/models/service-product.model';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ServiceDetailComponent implements OnInit {
  service!: ServiceProduct;

  constructor(
    private route: ActivatedRoute,
    private serviceProductService: ServiceProductService
  ) {}

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id')!;
    this.serviceProductService
      .getServiceById(serviceId)
      .subscribe((service) => {
        this.service = service;
      });
  }
}
