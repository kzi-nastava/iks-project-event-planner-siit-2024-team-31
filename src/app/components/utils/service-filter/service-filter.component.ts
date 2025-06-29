import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductCategoriesService } from '../../../services/product-categories/product-categories.service';
import { ProvidedServiceCategoriesService } from '../../../services/provided-service-categories/provided-service-categories.service';
import { ProductCategory } from '../../../types/productCategory';
import { ServiceCategory } from '../../../types/serviceCategory';

@Component({
  selector: 'app-service-product-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-filter.component.html',
  styleUrls: ['./service-filter.component.scss'],
  standalone: true,
})
export class ServiceFilterComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<any>();
  @Input() showProducts: boolean = true; // true for products, false for services

  filters = {
    fromDate: '',
    toDate: '',
    selectedCategories: [] as string[],
    selectedCities: [] as string[],
    selectedSuitability: [] as string[],
    minPrice: 0,
    maxPrice: 1000000,
  };

  categories: string[] = [];
  cities: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  suitabilityOptions: string[] = ['Wedding', 'Conference', 'Party', 'Concert'];

  filteredCategories: string[] = [];
  filteredCities: string[] = [...this.cities];
  filteredSuitability: string[] = [...this.suitabilityOptions];

  filtersForFilters = {
    categorySearch: '',
    citySearch: '',
    suitabilitySearch: '',
  };

  // UI state for collapsible sections
  expandedSections = {
    categories: true,
    availability: false,
    city: false,
    suitability: false,
    price: false,
  };

  constructor(
    private productCategoriesService: ProductCategoriesService,
    private serviceCategoriesService: ProvidedServiceCategoriesService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    if (this.showProducts) {
      // Load product categories using public endpoint
      this.productCategoriesService
        .searchProductCategoriesPublic('', 1, 100)
        .subscribe({
          next: (page) => {
            this.categories = page.content.map(
              (cat: ProductCategory) => cat.name
            );
            this.filteredCategories = [...this.categories];
          },
          error: (err) => {
            console.error('Error loading product categories:', err);
            // Fallback to hardcoded categories
            this.categories = [
              'Photography',
              'Catering',
              'Decoration',
              'Entertainment',
              'Logistics',
            ];
            this.filteredCategories = [...this.categories];
          },
        });
    } else {
      // Load service categories using public endpoint
      this.serviceCategoriesService
        .searchServiceCategoriesPublic('', 1, 100)
        .subscribe({
          next: (page) => {
            this.categories = page.content.map(
              (cat: ServiceCategory) => cat.name
            );
            this.filteredCategories = [...this.categories];
          },
          error: (err) => {
            console.error('Error loading service categories:', err);
            // Fallback to hardcoded categories
            this.categories = [
              'Photography',
              'Catering',
              'Decoration',
              'Entertainment',
              'Logistics',
            ];
            this.filteredCategories = [...this.categories];
          },
        });
    }
  }

  filterCategories() {
    const search = this.filtersForFilters.categorySearch.toLowerCase();
    this.filteredCategories = this.categories.filter((category) =>
      category.toLowerCase().includes(search)
    );
  }

  filterCities() {
    const search = this.filtersForFilters.citySearch.toLowerCase();
    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(search)
    );
  }

  filterSuitability() {
    const search = this.filtersForFilters.suitabilitySearch.toLowerCase();
    this.filteredSuitability = this.suitabilityOptions.filter((option) =>
      option.toLowerCase().includes(search)
    );
  }

  toggleSelection(
    value: string,
    key: 'selectedCategories' | 'selectedCities' | 'selectedSuitability'
  ) {
    const selectedArray = this.filters[key];
    const index = selectedArray.indexOf(value);

    if (index === -1) {
      selectedArray.push(value);
    } else {
      selectedArray.splice(index, 1);
    }

    // Uncomment if you want to apply filters on each selection
    // this.filtersChange.emit(this.filters);
  }

  applyFilters() {
    this.filtersChange.emit(this.filters);
  }

  toggleSection(section: keyof typeof this.expandedSections): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  resetFilters(): void {
    this.filters = {
      fromDate: '',
      toDate: '',
      selectedCategories: [],
      selectedCities: [],
      selectedSuitability: [],
      minPrice: 0,
      maxPrice: 1000000,
    };
    this.filtersForFilters = {
      categorySearch: '',
      citySearch: '',
      suitabilitySearch: '',
    };
    this.filteredCategories = [...this.categories];
    this.filteredCities = [...this.cities];
    this.filteredSuitability = [...this.suitabilityOptions];
    this.filtersChange.emit(this.filters);
  }

  // Method to be called when the product/service type changes
  onTypeChange(showProducts: boolean): void {
    this.showProducts = showProducts;
    this.filters.selectedCategories = []; // Reset selected categories
    this.loadCategories();
  }
}
