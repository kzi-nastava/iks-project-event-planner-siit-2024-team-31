import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-service-product',
  templateUrl: './service-create.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateServiceProductComponent {
  service = {
    category: '',
    name: '',
    description: '',
    characteristics: '',
    price: null,
    discount: null,
    images: [],
    eventTypes: [] as string[],
    isVisible: true,
    isAvailable: true,
    bookingDuration: null,
    minParticipation: null,
    maxParticipation: null,
    bookingPeriod: null,
    cancellationPeriod: null,
    confirmationMethod: 'Automatic',
  };

  categories = ['Category A', 'Category B', 'Category C'];
  eventTypes = [
    'Conference',
    'Exhibition',
    'Festival',
    'Networking',
    'Workshop',
  ];

  // Methods for handling actions like adding categories, uploading images, etc.

  addCategory() {
    // Logic to add a new category
  }

  uploadImages(event: any) {
    // Logic to upload images
  }

  toggleEventType(eventType: string) {
    const index = this.service.eventTypes.indexOf(eventType);
    if (index === -1) {
      this.service.eventTypes.push(eventType);
    } else {
      this.service.eventTypes.splice(index, 1);
    }
  }

  submitService() {
    // Logic to submit the service/product
    console.log('Service submitted:', this.service);
  }
}
