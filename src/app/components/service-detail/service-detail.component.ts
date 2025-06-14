import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product/products.service';
import { Product } from '../../types/models/product.model';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ServiceDetailComponent implements OnInit {
  service!: Product;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id')!;
    this.productService
      .getServiceById(serviceId)
      .subscribe((service: Product) => {
        this.service = service;
      });
  }
}
