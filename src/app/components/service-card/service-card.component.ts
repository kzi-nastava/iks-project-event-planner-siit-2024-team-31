import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceProduct } from '../../models/service-product.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class ServiceCardComponent {
  @Input() service!: ServiceProduct;
}
