import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { ProductCategoriesService } from '../../../services/product-categories/product-categories.service';
import { EventTypeDTO } from '../../../types/dto/eventTypeDTO';
import { EventTypeFullDTO } from '../../../types/dto/eventTypeFullDTO';
import { EventTypeCardComponent } from '../event-type-card/event-type-card.component';

@Component({
  selector: 'app-event-types-management',
  standalone: true,
  imports: [
    EventTypeCardComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  providers: [EventTypesService],
  styleUrls: ['./event-types-management.component.scss'],
  templateUrl: './event-types-management.component.html',
})
export class EventTypesManagementComponent implements OnInit {
  eventTypes: EventTypeDTO[] = [];
  currentPage = 1;
  totalPages = 0;
  itemsPerPage = 8;
  keyword = '';

  showCreateForm = false;

  constructor(
    private eventTypesService: EventTypesService,
    private productCategoriesService: ProductCategoriesService
  ) {}

  ngOnInit(): void {
    this.searchEventTypes();
  }

  searchEventTypes(): void {
    this.eventTypesService
      .searchEventTypes(this.keyword, this.currentPage, this.itemsPerPage)
      .subscribe((response) => {
        this.eventTypes = response.content;
        this.totalPages = response.totalPages;
      });
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.searchEventTypes();
    }
  }

  // Form handling
  newEventType: Partial<EventTypeFullDTO> = {
    name: '',
    description: '',
    recommendedProductCategories: [],
  };

  currentPageForm = 1;
  totalPagesForm = 0;
  itemsPerPageForm = 8;
  keywordForm = '';

  selectedProductCategories: number[] = [];

  recommendedProductCategoriesList: {
    name: string;
    id: number;
    description: string;
    status: string;
    selected: boolean;
  }[] = [];

  openCreateForm(): void {
    this.newEventType = {
      name: '',
      description: '',
      recommendedProductCategories: [],
    };
    this.selectedProductCategories = [];
    this.keywordForm = '';
    this.currentPageForm = 1;
    this.showCreateForm = true;

    this.loadProductCategories();
  }

  loadProductCategories(): void {
    this.productCategoriesService
      .searchProductCategories(
        this.keywordForm,
        this.currentPageForm,
        this.itemsPerPageForm
      )
      .subscribe((response) => {
        this.recommendedProductCategoriesList = response.content.map(
          (category) => ({
            name: category.name,
            id: category.id,
            description: category.description,
            status: category.status.name,
            selected: this.selectedProductCategories.includes(category.id),
          })
        );
        this.totalPagesForm = response.totalPages;
      });
  }

  toggleToSelectedList(id: number): void {
    const index = this.selectedProductCategories.indexOf(id);
    if (index === -1) {
      this.selectedProductCategories.push(id);
    } else {
      this.selectedProductCategories.splice(index, 1);
    }
  }

  changePageForm(page: number): void {
    if (page > 0 && page <= this.totalPagesForm) {
      this.currentPageForm = page;
      this.loadProductCategories();
    }
    if (this.totalPagesForm === 0) {
      this.loadProductCategories();
    }
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  createNewEventType(): void {
    const newEventType: EventTypeFullDTO = {
      id: 0,
      name: this.newEventType.name?.trim() || '',
      description: this.newEventType.description?.trim() || '',
      status: {
        id: 1,
        version: 1,
        name: 'Active',
        description: 'Active status',
      },
      recommendedProductCategories: this.selectedProductCategories.map((id) => {
        const category = this.recommendedProductCategoriesList.find(
          (cat) => cat.id === id
        );
        return {
          id: category?.id || 0,
          name: category?.name || '',
          description: category?.description || '',
          status: {
            id: 1,
            version: 1,
            name: 'Active',
            description: 'Active status',
          },
        };
      }),
    };

    this.eventTypesService.createEventType(newEventType).subscribe({
      next: (response) => {
        alert('Event type created successfully: ' + response.message);
        this.showCreateForm = false;
        this.searchEventTypes();
      },
      error: (err) => {
        console.error('Error creating event type:', err);
        alert('Error creating event type. Check the console for details.');
      },
    });
  }

  getSelectedCategoryName(categoryId: number): string {
    const category = this.recommendedProductCategoriesList.find(
      (cat) => cat.id === categoryId
    );
    return category ? category.name : 'Unknown Category';
  }
}
