import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-filter.component.html',
  standalone: true,
})
export class EventFilterComponent {
  @Output() filtersChange = new EventEmitter<any>();

  filters = {
    eventType: '',
    fromDate: '',
    toDate: '',
    selectedTypes: [] as string[],
    selectedCities: [] as string[],
    selectedLocations: [] as string[],
    minGuests: 0,
    maxGuests: 1000000,
  };

  types: string[] = [
    'Conference',
    'Exhibition',
    'Festival',
    'Networking',
    'Workshop',
  ];
  cities: string[] = [
    'San Francisco',
    'New York',
    'Austin',
    'Seattle',
    'Chicago',
  ];
  objects: string[] = [
    'Hall A',
    'Hall B',
    'Main Auditorium',
    'Outdoor Stage',
    'Room 101',
  ];

  filteredTypes: string[] = [...this.types];
  filteredCities: string[] = [...this.cities];
  filteredObject: string[] = [...this.objects];

  filtersForFilters = {
    eventTypeSearch: '',
    citySearch: '',
    objectSearch: '',
  };

  constructor() {}

  filterTypes() {
    const search = this.filtersForFilters.eventTypeSearch.toLowerCase();
    this.filteredTypes = this.types.filter((type) =>
      type.toLowerCase().includes(search)
    );
  }

  filterCities() {
    const search = this.filtersForFilters.citySearch.toLowerCase();
    this.filteredCities = this.cities.filter((city) =>
      city.toLowerCase().includes(search)
    );
  }

  filterLocations() {
    const search = this.filtersForFilters.objectSearch.toLowerCase();
    this.filteredObject = this.objects.filter((location) =>
      location.toLowerCase().includes(search)
    );
  }

  toggleSelection(
    value: string,
    key: 'selectedTypes' | 'selectedCities' | 'selectedLocations'
  ) {
    const selectedArray = this.filters[key];
    const index = selectedArray.indexOf(value);

    if (index === -1) {
      selectedArray.push(value);
    } else {
      selectedArray.splice(index, 1);
    }

    //enable if we want to apply filters on each selection
    //this.filtersChange.emit(this.filters);
  }

  applyFilters() {
    this.filtersChange.emit(this.filters);
  }
}
