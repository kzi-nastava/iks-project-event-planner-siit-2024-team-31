import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ProductService } from '../../../services/product/products.service';
import { ProvidedServiceService } from '../../../services/provided-service/provided-service.service';
import {
  ProductFilters,
  ServiceFilters,
} from '../../../types/filter.interface';
import { Product } from '../../../types/models/product.model';
import { Service } from '../../../types/models/service.model';
import { PaginatedResponse } from '../../../types/pagination.interface';
import { ServiceCardComponent } from '../../service-card/service-card.component';
import { AdvancedFilterComponent } from '../../utils/advanced-filter/advanced-filter.component';

@Component({
  selector: 'app-service-product-list-filtered',
  templateUrl: './service-product-list-filtered.component.html',
  imports: [CommonModule, AdvancedFilterComponent, ServiceCardComponent],
  standalone: true,
})
export class ServiceProductListFilteredComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<ServiceFilters | ProductFilters>();

  // Data
  items: (Product | Service)[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 12; // 3x4 grid
  totalPages = 0;
  totalElements = 0;
  hasMore = false;

  // Filter state
  currentType: 'services' | 'products' = 'services';
  currentFilters: ServiceFilters | ProductFilters = {};

  // UI State
  showTypeToggle = true;

  constructor(
    private productService: ProductService,
    private providedServiceService: ProvidedServiceService
  ) {}

  ngOnInit(): void {
    this.initializeFilters();
    this.setupFilterDebouncing();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters(): void {
    if (this.currentType === 'services') {
      this.currentFilters = {
        searchTerm: '',
        categoryIds: [],
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        isAvailable: true,
        sortBy: 'name',
        sortDirection: 'asc',
      } as ServiceFilters;
    } else {
      this.currentFilters = {
        searchTerm: '',
        categoryIds: [],
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0,
        isAvailable: true,
        sortBy: 'name',
        sortDirection: 'asc',
      } as ProductFilters;
    }
  }

  private setupFilterDebouncing(): void {
    this.filterSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        switchMap((filters) => {
          this.currentFilters = filters;
          this.currentPage = 0; // Reset to first page
          return this.fetchData();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: PaginatedResponse<Product | Service>) => {
          this.handleDataResponse(response);
        },
        error: (error: any) => {
          this.handleError(error);
        },
      });
  }

  private fetchData(): Observable<PaginatedResponse<Product | Service>> {
    this.loading = true;
    this.error = null;

    if (this.currentType === 'services') {
      return this.providedServiceService.getServicesWithFilters(
        this.currentPage,
        this.pageSize,
        this.currentFilters as ServiceFilters
      ) as Observable<PaginatedResponse<Product | Service>>;
    } else {
      return this.productService.getProductsWithFilters(
        this.currentPage,
        this.pageSize,
        this.currentFilters as ProductFilters
      ) as Observable<PaginatedResponse<Product | Service>>;
    }
  }

  private loadData(): void {
    this.fetchData().subscribe({
      next: (response: PaginatedResponse<Product | Service>) => {
        this.handleDataResponse(response);
      },
      error: (error: any) => {
        this.handleError(error);
      },
    });
  }

  private handleDataResponse(
    response: PaginatedResponse<Product | Service>
  ): void {
    this.items = response.content || [];
    this.totalPages = response.totalPages || 0;
    this.totalElements = response.totalElements || 0;
    this.hasMore = !response.last;
    this.loading = false;
  }

  private handleError(error: any): void {
    console.error('Error loading data:', error);
    this.error = 'Failed to load data. Please try again.';
    this.loading = false;
    this.items = [];
  }

  // Event handlers
  onTypeToggle(): void {
    this.currentType =
      this.currentType === 'services' ? 'products' : 'services';
    this.initializeFilters();
    this.currentFilters = { ...this.currentFilters };
    this.loadData();
  }

  onFiltersChange(filters: ServiceFilters | ProductFilters): void {
    this.filterSubject$.next(filters);
  }

  onResetFilters(): void {
    this.initializeFilters();
    this.currentFilters = { ...this.currentFilters };
    this.loadData();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.hasMore) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Helper methods
  get displayedPageNumber(): number {
    return this.currentPage + 1; // Convert from 0-based to 1-based for display
  }

  get displayedTotalPages(): number {
    return Math.max(this.totalPages, 1);
  }

  get paginationInfo(): string {
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.totalElements);
    return `${start}-${end} of ${this.totalElements}`;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 0;
  }

  get hasNextPage(): boolean {
    return this.hasMore;
  }

  // Generate array for pagination numbers
  get visiblePages(): number[] {
    const current = this.currentPage;
    const total = this.totalPages;
    const delta = 2; // Show 2 pages before and after current

    let start = Math.max(0, current - delta);
    let end = Math.min(total - 1, current + delta);

    // Adjust if we're near the beginning or end
    if (current <= delta) {
      end = Math.min(total - 1, 2 * delta);
    }
    if (current >= total - delta - 1) {
      start = Math.max(0, total - 2 * delta - 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Generate skeleton items for loading state
  get skeletonItems(): any[] {
    return new Array(this.pageSize).fill(null);
  }

  // TrackBy function for performance optimization
  trackByItemId(index: number, item: Product | Service): string {
    return item.id;
  }
}
