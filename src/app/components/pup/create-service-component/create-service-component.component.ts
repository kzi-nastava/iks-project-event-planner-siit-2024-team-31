import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
	EventTypesService
} from '../../../services/event-types/event-types.service'; // Отдельный сервис для работы с типами событий
import {
	ServiceProductService
} from '../../../services/service-products/service-products.service';
import {
	ProductCategoriesService
} from '../../../services/product-categories/product-categories.service';
import {EventType} from '../../../types/eventType'; // { id: number; name: string; }
import {ProductCategory} from '../../../types/productCategory';
import {Page} from '../../../types/page';
import {Router} from "@angular/router";

@Component({
	selector: 'app-create-service',
	templateUrl: './create-service-component.component.html',
	standalone: true,
	imports: [CommonModule, FormsModule],
})
export class CreateServiceComponent implements OnInit {
	// ------------
	// Pagination for categories (server-side through ProductCategoriesService)
	// ------------
	currentCategoryPage: number = 1;
	totalCategoryPages: number = 0;
	categoryPageSize: number = 10;
	paginatedCategories: ProductCategory[] = [];
	searchQuery: string = '';

	// ------------
	// Pagination for event types (server-side through EventTypesService)
	// ------------
	currentEventTypePage: number = 1;
	totalEventTypePages: number = 0;
	eventTypesPageSize: number = 5;
	paginatedEventTypes: EventType[] = [];
	eventTypesQuery: string = '';

	//Flag for modals
	showCategoryModal = false;
	showEventTypeModal = false;

	// ------------
	// Photo upload and preview
	// ------------
	photoPreviews: string[] = [];
	filesForUpload: File[] = [];

	// Service data contains all the fields for the service
	serviceData = {
		name: '',
		description: '',
		peculiarities: '',
		category: '',
		price: 0,
		discount: 0,
		suitableEventTypes: [] as EventType[],
		isVisible: false,
		isAvailable: false,
		serviceDurationMin: 0,
		serviceDurationMax: 0,
		bookingDeclineDeadline: 0,
		noTimeSelectionRequired: true,
		manualTimeSelection: false,
		bookingConfirmation: 'Manual' as 'Manual' | 'Auto',
	};

	constructor(
		public productService: ServiceProductService,
		// public eventService: EventService,
		public productCategoryService: ProductCategoriesService,
		public eventTypesService: EventTypesService,
		private router: Router
	) {
	}

	ngOnInit(): void {
		this.loadCategories();
		this.loadEventTypes();
	}

	// ---------------------------------
	// Methods for working with categories
	// ---------------------------------
	loadCategories(): void {
		this.productCategoryService
			.searchProductCategories(this.searchQuery, this.currentCategoryPage, this.categoryPageSize)
			.subscribe({
				next: (page: Page<ProductCategory>) => {
					this.paginatedCategories = page.content;
					this.totalCategoryPages = page.totalPages;
				},
				error: (err) => console.error('Error loading categories:', err),
			});
	}

	onSearchQueryChange(): void {
		this.currentCategoryPage = 1;
		this.loadCategories();
	}

	previousCategoryPage(): void {
		if (this.currentCategoryPage > 1) {
			this.currentCategoryPage--;
			this.loadCategories();
		}
	}

	nextCategoryPage(): void {
		if (this.currentCategoryPage < this.totalCategoryPages) {
			this.currentCategoryPage++;
			this.loadCategories();
		}
	}

	openCategoryPopup(): void {
		this.showCategoryModal = true;
		this.searchQuery = '';
		this.currentCategoryPage = 1;
		this.loadCategories();
	}

	closeCategoryPopup(): void {
		this.showCategoryModal = false;
	}

	selectCategory(cat: string): void {
		this.serviceData.category = cat;
		this.closeCategoryPopup();
	}

	createNewCategory(): void {
		const newCat = this.searchQuery.trim();
		if (newCat) {
			this.serviceData.category = newCat;
			this.closeCategoryPopup();
		}
	}

	// ---------------------------------
	// Methods for working with event types
	// ---------------------------------
	loadEventTypes(): void {
		this.eventTypesService
			.searchEventTypes(this.eventTypesQuery, this.currentEventTypePage, this.eventTypesPageSize)
			.subscribe({
				next: (page: Page<EventType>) => {
					this.paginatedEventTypes = page.content;
					this.totalEventTypePages = page.totalPages;
				},
				error: (err) => console.error('Error loading event types:', err),
			});
	}

	onEventTypesQueryChange(): void {
		this.currentEventTypePage = 1;
		this.loadEventTypes();
	}

	previousEventTypePage(): void {
		if (this.currentEventTypePage > 1) {
			this.currentEventTypePage--;
			this.loadEventTypes();
		}
	}

	nextEventTypePage(): void {
		if (this.currentEventTypePage < this.totalEventTypePages) {
			this.currentEventTypePage++;
			this.loadEventTypes();
		}
	}

	openEventTypePopup(): void {
		this.showEventTypeModal = true;
		this.eventTypesQuery = '';
		this.currentEventTypePage = 1;
		this.loadEventTypes();
	}

	closeEventTypePopup(): void {
		this.showEventTypeModal = false;
	}

	isEventTypeSelected(type: EventType): boolean {
		return this.serviceData.suitableEventTypes.some(et => et.id === type.id);
	}

	toggleEventTypeSelection(type: EventType, event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.checked) {
			if (!this.isEventTypeSelected(type)) {
				this.serviceData.suitableEventTypes.push({...type});
			}
		} else {
			this.serviceData.suitableEventTypes = this.serviceData.suitableEventTypes.filter(et => et.id !== type.id);
		}
	}

	confirmAddEventTypes(): void {
		this.showEventTypeModal = false;
	}

	removeSuitableEventType(index: number): void {
		this.serviceData.suitableEventTypes.splice(index, 1);
		this.loadEventTypes();
	}

	// ---------------------------------
	// Photos upload and preview
	// ---------------------------------
	onPhotosSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		for (let i = 0; i < input.files.length; i++) {
			const file = input.files[i];
			this.filesForUpload.push(file);
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				const result = e.target?.result;
				if (result && typeof result === 'string') {
					this.photoPreviews.push(result);
				}
			};
			reader.readAsDataURL(file);
		}
		input.value = '';
	}

	removePreview(index: number): void {
		this.photoPreviews.splice(index, 1);
		this.filesForUpload.splice(index, 1);
	}

	// ---------------------------------
	// Service time management
	// ---------------------------------
	get disableMinField(): boolean {
		return this.serviceData.noTimeSelectionRequired;
	}

	get disableMaxField(): boolean {
		return this.serviceData.noTimeSelectionRequired || !this.serviceData.manualTimeSelection;
	}

	get disableBookingDeadline(): boolean {
		return this.serviceData.noTimeSelectionRequired;
	}

	onNoTimeSelectionChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const isChecked = input.checked;
		this.serviceData.noTimeSelectionRequired = isChecked;
		if (isChecked) {
			this.serviceData.serviceDurationMin = 0;
			this.serviceData.serviceDurationMax = 0;
			this.serviceData.bookingDeclineDeadline = 0;
			this.serviceData.manualTimeSelection = false;
		}
	}

	onManualTimeSelectionChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const isChecked = input.checked;
		this.serviceData.manualTimeSelection = isChecked;
		if (!isChecked) {
			this.serviceData.serviceDurationMax = 0;
		}
	}

	// ---------------------------------
	// Send form data to the server
	// ---------------------------------
	onSubmit(): void {
		console.log('Form submitted!', this.serviceData);
		const formData = new FormData();
		formData.append('name', this.serviceData.name);
		formData.append('category', this.serviceData.category);
		formData.append('description', this.serviceData.description);
		formData.append('peculiarities', this.serviceData.peculiarities);
		formData.append('price', this.serviceData.price.toString());
		formData.append('discount', this.serviceData.discount.toString());

		this.serviceData.suitableEventTypes.forEach((et) => {
			formData.append('suitableEventTypes', et.id.toString());
		});

		formData.append('isVisible', this.serviceData.isVisible ? 'true' : 'false');
		formData.append('isAvailable', this.serviceData.isAvailable ? 'true' : 'false');
		formData.append('serviceDurationMin', this.serviceData.serviceDurationMin.toString());
		formData.append('serviceDurationMax', this.serviceData.serviceDurationMax.toString());
		formData.append('bookingDeclineDeadline', this.serviceData.bookingDeclineDeadline.toString());
		formData.append('noTimeSelectionRequired', this.serviceData.noTimeSelectionRequired ? 'true' : 'false');
		formData.append('manualTimeSelection', this.serviceData.manualTimeSelection ? 'true' : 'false');
		formData.append('bookingConfirmation', this.serviceData.bookingConfirmation);

		this.filesForUpload.forEach((file) => {
			formData.append('photos', file);
		});

		this.productService.createNewService(formData).subscribe({
			next: (response) => {
				console.log('Success:', response)
				alert('Service created successfully!');
				this.router.navigate(['/pup/my-products-services'])
					.then(r => console.log('Redirected to my products/services page:', r));
			},
			error: (err) => {
				console.error('Error:', err)
				alert('Error creating service, check console for details');
			},
		});


	}

}