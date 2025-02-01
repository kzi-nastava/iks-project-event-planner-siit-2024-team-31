import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
	EventTypesService
} from '../../../services/event-types/event-types.service';
import {EventTypeFullDTO} from '../../../types/dto/eventTypeFullDTO';
import {
	ProductCategoriesService
} from '../../../services/product-categories/product-categories.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ProductCategory} from '../../../types/productCategory';

@Component({
	selector: 'app-event-type-page',
	templateUrl: './event-type-page.component.html',
	styleUrls: ['./event-type-page.component.scss'],
	imports: [
		FormsModule,
		CommonModule,
		MatButtonModule,
		MatTooltipModule
	],
})
export class EventTypePageComponent implements OnInit {
	eventType!: EventTypeFullDTO;
	isLoading = true;
	errorMessage = '';
	showEditForm = false;

	editData: Partial<EventTypeFullDTO> = {};
	selectedProductCategories: number[] = [];
	removedProductCategories: number[] = [];
	private originalCategoryIds: number[] = [];

	recommendedProductCategoriesList: any[] = [];

	keywordEdit = '';
	currentPageEdit = 1;
	itemsPerPageEdit = 5;
	totalPagesEdit = 0;

	constructor(
		private route: ActivatedRoute,
		private eventTypesService: EventTypesService,
		private productCategoriesService: ProductCategoriesService
	) {
	}

	ngOnInit() {
		const id = Number(this.route.snapshot.paramMap.get('id'));
		this.loadEventType(id);
	}

	private loadEventType(id: number): void {
		this.isLoading = true;
		this.eventTypesService.getEventTypeById(id).subscribe({
			next: (data) => {
				this.eventType = data;
				this.isLoading = false;

				//copy data to editData for editing
				this.editData = {...data};
				this.originalCategoryIds = data.recommendedProductCategories.map(c => c.id);
				this.selectedProductCategories = [...this.originalCategoryIds];
				this.removedProductCategories = [];
			},
			error: (err) => {
				this.errorMessage = 'Failed to load event type';
				this.isLoading = false;
				console.error(err);
			}
		});
	}

	openEditForm(): void {
		this.showEditForm = true;
		this.loadEventFormData();
	}

	private loadEventFormData(): void {
		this.loadProductCategories();
		this.keywordEdit = '';
		this.currentPageEdit = 1;
		this.itemsPerPageEdit = 5;
		this.totalPagesEdit = 0;
	}

	changePageForm(page: number): void {
		if (page > 0 && page <= this.totalPagesEdit) {
			this.currentPageEdit = page;
			this.loadProductCategories();
		}
		if (this.totalPagesEdit === 0) {
			this.loadProductCategories();
		}
	}

	loadProductCategories(): void {
		this.productCategoriesService
			.searchProductCategories(this.keywordEdit, this.currentPageEdit, this.itemsPerPageEdit)
			.subscribe((response) => {
				this.recommendedProductCategoriesList = response.content.map((category) => ({
					...category,
					selected: this.selectedProductCategories.includes(category.id)
				}));
				this.totalPagesEdit = response.totalPages;
			});
	}

	toggleCategorySelection(id: number): void {
		const index = this.selectedProductCategories.indexOf(id);

		if (index === -1) {
			this.selectedProductCategories.push(id);

			const removedIndex = this.removedProductCategories.indexOf(id);
			if (removedIndex !== -1) {
				this.removedProductCategories.splice(removedIndex, 1);
			}

		} else {
			this.selectedProductCategories.splice(index, 1);

			// If this category was in originalCategoryIds,
			// then it's considered "removed" now => add it to removedProductCategories
			if (this.originalCategoryIds.includes(id)) {
				if (!this.removedProductCategories.includes(id)) {
					this.removedProductCategories.push(id);
				}
			}
		}

		this.recommendedProductCategoriesList = this.recommendedProductCategoriesList.map(cat => {
			if (cat.id === id) {
				return {...cat, selected: !cat.selected};
			}
			return cat;
		});
	}

	onSwitchStatus(): void {
		const newStatus = !(this.eventType.status.name === 'ACTIVE');
		if (confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this event type?`)) {
			this.eventTypesService.switchEventTypeStatus(this.eventType.id, newStatus).subscribe({
				next: (response) => {
					alert(`Event type ${newStatus ? 'activated' : 'deactivated'} successfully`);
					this.loadEventType(this.eventType.id);
				},
				error: (err) => {
					console.error('Status change error:', err);
					alert('Error changing status');
				}
			});
		}
	}

	updateEventType(): void {
		const updatedEventType: EventTypeFullDTO = {
			...this.eventType,
			name: this.editData.name?.trim() || '',
			description: this.editData.description?.trim() || '',
			recommendedProductCategories: this.selectedProductCategories.map(
				(id) => ({id} as ProductCategory)
			),
		};

		//Delete removed categories for original+added list of categories
		updatedEventType.recommendedProductCategories = updatedEventType.recommendedProductCategories
			.filter((cat) => !this.removedProductCategories.includes(cat.id));

		this.eventTypesService.updateEventType(this.eventType.id, updatedEventType).subscribe({
			next: (response) => {
				alert('Event type updated successfully');
				this.showEditForm = false;
				this.loadEventType(this.eventType.id);
			},
			error: (err) => {
				console.error('Update error:', err);
				alert('Error updating event type');
			}
		});
	}

	closeEditForm(): void {
		this.showEditForm = false;
		this.loadEventType(this.eventType.id);
	}
}