import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-product-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './service-filter.component.html',
  standalone: true,
})
export class ServiceFilterComponent {
  @Output() filtersChange = new EventEmitter<any>();

  filters = {
    fromDate: '',
    toDate: '',
    selectedCategories: [] as string[],
    selectedCities: [] as string[],
    selectedSuitability: [] as string[],
    minPrice: 0,
    maxPrice: 1000000,
  };

  categories: string[] = [
    'Photography',
    'Catering',
    'Decoration',
    'Entertainment',
    'Logistics',
  ];
  cities: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  suitabilityOptions: string[] = ['Wedding', 'Conference', 'Party', 'Concert'];

  switcher: boolean = true; // true for products, false for services

  filteredCategories: string[] = [...this.categories];
  filteredCities: string[] = [...this.cities];
  filteredSuitability: string[] = [...this.suitabilityOptions];

  filtersForFilters = {
    categorySearch: '',
    citySearch: '',
    suitabilitySearch: '',
  };

  constructor() {}

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
}
