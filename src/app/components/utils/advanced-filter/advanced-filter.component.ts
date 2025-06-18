import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { ProductCategoriesService } from '../../../services/product-categories/product-categories.service';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceCategoriesService } from '../../../services/provided-service-categories/provided-service-categories.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import {
  FilterOption,
  ProductFilters,
  ServiceFilters,
} from '../../../types/filter.interface';

@Component({
  selector: 'app-advanced-filter',
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdvancedFilterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentType: 'services' | 'products' = 'services';
  @Input() initialFilters: ServiceFilters | ProductFilters | null = null;
  @Output() filtersChange = new EventEmitter<ServiceFilters | ProductFilters>();
  @Output() resetFilters = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  // Filter state
  serviceFilters: ServiceFilters = {};
  productFilters: ProductFilters = {};

  // Filter options
  categories: FilterOption[] = [];
  suitableForOptions: FilterOption[] = [];
  priceRange = { min: 0, max: 10000 };
  ratingRange = { min: 0, max: 5 };

  // UI state
  expandedSections = {
    search: true,
    categories: true,
    price: true,
    rating: true,
    availability: false,
    timeUsage: false,
    suitability: false,
    sorting: false,
  };

  // Search terms for filtering options
  categorySearch = '';
  suitabilitySearch = '';

  constructor(
    private productService: ProductService,
    private serviceService: ProvidedServiceService,
    private productCategoriesService: ProductCategoriesService,
    private serviceCategoriesService: ProvidedServiceCategoriesService,
    private eventTypesService: EventTypesService
  ) {}

  ngOnInit(): void {
    this.initializeFilters();
    this.loadFilterOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters'] && this.initialFilters) {
      this.syncFilters();
    }
    if (changes['currentType']) {
      this.initializeFilters();
      this.loadFilterOptions();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private syncFilters(): void {
    if (this.initialFilters) {
      if (this.currentType === 'services') {
        this.serviceFilters = { ...(this.initialFilters as ServiceFilters) };
      } else {
        this.productFilters = { ...(this.initialFilters as ProductFilters) };
      }
    }
  }

  private initializeFilters(): void {
    if (this.initialFilters) {
      this.syncFilters();
    } else {
      this.serviceFilters = {
        searchTerm: '',
        categoryIds: [],
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        availableFrom: '',
        availableTo: '',
        serviceDurationMinMinutes: undefined,
        serviceDurationMaxMinutes: undefined,
        suitableFor: [],
        isAvailable: true,
        sortBy: 'name',
        sortDirection: 'asc',
      };

      this.productFilters = {
        searchTerm: '',
        categoryIds: [],
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        suitableFor: [],
        isAvailable: true,
        sortBy: 'name',
        sortDirection: 'asc',
      };
    }
  }

  private loadFilterOptions(): void {
    this.loadEventTypes();
    if (this.currentType === 'services') {
      this.loadServiceOptions();
    } else {
      this.loadProductOptions();
    }
  }

  private loadEventTypes(): void {
    this.eventTypesService
      .publicSearchEventTypes('', 1, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.suitableForOptions = response.content.map((eventType) => ({
            id: eventType.id.toString(),
            name: eventType.name,
          }));
        },
        error: () => {
          // Fallback options in case of error
          this.suitableForOptions = [{ id: '1', name: 'ERROR' }];
        },
      });
  }

  private loadServiceOptions(): void {
    // Load service categories
    this.serviceCategoriesService
      .searchServiceCategoriesPublic('', 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.content.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
          }));
        },
        error: () => {
          // Fallback categories
          this.categories = [
            { id: '1', name: 'Photography' },
            { id: '2', name: 'Catering' },
            { id: '3', name: 'Decoration' },
            { id: '4', name: 'Entertainment' },
            { id: '5', name: 'Logistics' },
          ];
        },
      });

    // Load service price and rating ranges
    this.serviceService
      .getServiceFilterOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.priceRange = options.priceRange || { min: 0, max: 10000 };
          this.ratingRange = options.ratingRange || { min: 0, max: 5 };
        },
        error: () => {
          // Keep default ranges
        },
      });
  }

  private loadProductOptions(): void {
    // Load product categories
    this.productCategoriesService
      .searchProductCategoriesPublic('', 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.content.map((cat) => ({
            id: cat.id.toString(),
            name: cat.name,
          }));
        },
        error: () => {
          // Fallback categories
          this.categories = [
            { id: '1', name: 'Photography Equipment' },
            { id: '2', name: 'Catering Supplies' },
            { id: '3', name: 'Decorations' },
            { id: '4', name: 'Audio/Video' },
            { id: '5', name: 'Furniture' },
          ];
        },
      });

    // Load product price and rating ranges
    this.productService
      .getProductFilterOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.priceRange = options.priceRange || { min: 0, max: 10000 };
          this.ratingRange = options.ratingRange || { min: 0, max: 5 };
        },
        error: () => {
          // Keep default ranges
        },
      });
  }

  onTypeChange(newType: 'services' | 'products'): void {
    this.currentType = newType;
    this.initializeFilters();
    this.loadFilterOptions();
  }

  toggleSection(section: keyof typeof this.expandedSections): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  toggleCategory(categoryId: string): void {
    const filters = this.getCurrentFilters();
    const categoryIds = [...(filters.categoryIds || [])];

    const index = categoryIds.indexOf(categoryId);
    if (index > -1) {
      categoryIds.splice(index, 1);
    } else {
      categoryIds.push(categoryId);
    }

    filters.categoryIds = categoryIds;

    if (this.currentType === 'services') {
      this.serviceFilters.categoryIds = categoryIds;
    } else {
      this.productFilters.categoryIds = categoryIds;
    }

    this.emitFilters();
  }

  toggleSuitability(optionId: string): void {
    const filters = this.getCurrentFilters();
    const suitableFor = [...(filters.suitableFor || [])];

    const index = suitableFor.indexOf(optionId);
    if (index > -1) {
      suitableFor.splice(index, 1);
    } else {
      suitableFor.push(optionId);
    }

    filters.suitableFor = suitableFor;

    if (this.currentType === 'services') {
      this.serviceFilters.suitableFor = suitableFor;
    } else {
      this.productFilters.suitableFor = suitableFor;
    }

    this.emitFilters();
  }

  onSearchChange(): void {
    this.emitFilters();
  }

  onPriceChange(): void {
    const filters = this.getCurrentFilters();

    // Обработка пустых значений цены (конвертируем к числу)
    if (
      filters.minPrice === null ||
      filters.minPrice === undefined ||
      isNaN(Number(filters.minPrice))
    ) {
      filters.minPrice = 0;
    } else {
      filters.minPrice = Number(filters.minPrice);
    }

    if (
      filters.maxPrice === null ||
      filters.maxPrice === undefined ||
      isNaN(Number(filters.maxPrice))
    ) {
      filters.maxPrice = 10000;
    } else {
      filters.maxPrice = Number(filters.maxPrice);
    }

    // Убеждаемся, что minPrice не больше maxPrice
    if (filters.minPrice > filters.maxPrice) {
      filters.minPrice = filters.maxPrice;
    }

    this.emitFilters();
  }

  onRatingChange(): void {
    const filters = this.getCurrentFilters();

    // Обработка пустых значений рейтинга
    if (
      filters.minRating === null ||
      filters.minRating === undefined ||
      isNaN(Number(filters.minRating))
    ) {
      filters.minRating = 0;
    } else {
      filters.minRating = Number(filters.minRating);
    }

    this.emitFilters();
  }

  onDateChange(): void {
    if (this.currentType === 'services') {
      this.emitFilters();
    }
  }

  onDurationChange(): void {
    if (this.currentType === 'services') {
      const filters = this.serviceFilters;

      // Обработка пустых значений длительности сервиса
      if (
        filters.serviceDurationMinMinutes !== null &&
        filters.serviceDurationMinMinutes !== undefined &&
        !isNaN(Number(filters.serviceDurationMinMinutes))
      ) {
        filters.serviceDurationMinMinutes = Number(
          filters.serviceDurationMinMinutes
        );
      } else {
        filters.serviceDurationMinMinutes = undefined;
      }

      if (
        filters.serviceDurationMaxMinutes !== null &&
        filters.serviceDurationMaxMinutes !== undefined &&
        !isNaN(Number(filters.serviceDurationMaxMinutes))
      ) {
        filters.serviceDurationMaxMinutes = Number(
          filters.serviceDurationMaxMinutes
        );
      } else {
        filters.serviceDurationMaxMinutes = undefined;
      }

      this.emitFilters();
    }
  }

  onSortChange(): void {
    this.emitFilters();
  }

  onAvailabilityChange(): void {
    this.emitFilters();
  }

  resetAllFilters(): void {
    this.initializeFilters();
    this.resetFilters.emit();
  }

  getCurrentFilters(): ServiceFilters | ProductFilters {
    return this.currentType === 'services'
      ? this.serviceFilters
      : this.productFilters;
  }

  private emitFilters(): void {
    const filters = this.getCurrentFilters();

    // deep copy filters before emitting
    const filtersToEmit = JSON.parse(JSON.stringify(filters));

    // additional validation before emitting
    if (
      filtersToEmit.minPrice === null ||
      filtersToEmit.minPrice === undefined ||
      isNaN(Number(filtersToEmit.minPrice))
    ) {
      filtersToEmit.minPrice = 0;
    } else {
      filtersToEmit.minPrice = Number(filtersToEmit.minPrice);
    }

    if (
      filtersToEmit.maxPrice === null ||
      filtersToEmit.maxPrice === undefined ||
      isNaN(Number(filtersToEmit.maxPrice))
    ) {
      filtersToEmit.maxPrice = 10000;
    } else {
      filtersToEmit.maxPrice = Number(filtersToEmit.maxPrice);
    }

    if (
      filtersToEmit.minRating === null ||
      filtersToEmit.minRating === undefined ||
      isNaN(Number(filtersToEmit.minRating))
    ) {
      filtersToEmit.minRating = 0;
    } else {
      filtersToEmit.minRating = Number(filtersToEmit.minRating);
    }

    this.filtersChange.emit(filtersToEmit);
  }

  get filteredCategories(): FilterOption[] {
    if (!this.categorySearch) return this.categories;
    return this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  get filteredSuitabilityOptions(): FilterOption[] {
    if (!this.suitabilitySearch) return this.suitableForOptions;
    return this.suitableForOptions.filter((option) =>
      option.name.toLowerCase().includes(this.suitabilitySearch.toLowerCase())
    );
  }

  isCategorySelected(categoryId: string): boolean {
    const filters = this.getCurrentFilters();
    return (filters.categoryIds || []).includes(categoryId);
  }

  isSuitabilitySelected(optionId: string): boolean {
    const filters = this.getCurrentFilters();
    return (filters.suitableFor || []).includes(optionId);
  }
}
