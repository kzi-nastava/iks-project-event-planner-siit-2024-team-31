import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { EventTypesService } from '../../../services/event-types/event-types.service';
import { EventType } from '../../../types/eventType';
import { EventFilters } from '../../../types/filter.interface';

@Component({
  selector: 'app-event-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-filter.component.html',
  standalone: true,
})
export class EventFilterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private filterSubject$ = new Subject<EventFilters>();

  @Input() initialFilters: EventFilters | null = null;
  @Output() filtersChange = new EventEmitter<EventFilters>();
  @Output() resetFilters = new EventEmitter<void>();

  filters: EventFilters = {
    searchTerm: '',
    eventTypeIds: [],
    fromDate: '',
    toDate: '',
    minGuests: undefined,
    maxGuests: undefined,
    city: '',
  };

  availableEventTypes: EventType[] = [];

  // UI state
  expandedSections = {
    search: true,
    eventTypes: true,
    dateRange: true,
    city: true,
    guests: true,
  };

  constructor(private eventTypesService: EventTypesService) {}

  ngOnInit(): void {
    this.initializeFilters();
    this.loadEventTypes();
    this.setupFilterDebouncing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilters(): void {
    if (this.initialFilters) {
      this.filters = { ...this.initialFilters };
    }
  }

  private setupFilterDebouncing(): void {
    this.filterSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          // Custom comparison that properly handles arrays
          if (prev === curr) return true;
          if (!prev || !curr) return false;

          // Compare each property properly
          return (
            prev.searchTerm === curr.searchTerm &&
            prev.city === curr.city &&
            prev.fromDate === curr.fromDate &&
            prev.toDate === curr.toDate &&
            prev.minGuests === curr.minGuests &&
            prev.maxGuests === curr.maxGuests &&
            JSON.stringify(prev.eventTypeIds?.sort()) ===
              JSON.stringify(curr.eventTypeIds?.sort())
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.filtersChange.emit(filters);
      });
  }

  private loadEventTypes(): void {
    this.eventTypesService
      .publicSearchEventTypes('', 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.availableEventTypes = page.content.map((dto) => ({
            id: dto.id,
            name: dto.name,
          }));
        },
        error: (error: any) => {
          console.error('Error loading event types:', error);
          // Fallback data in case of error
          this.availableEventTypes = [
            { id: 1, name: 'Conference' },
            { id: 2, name: 'Workshop' },
            { id: 3, name: 'Seminar' },
            { id: 4, name: 'Networking' },
            { id: 5, name: 'Exhibition' },
          ];
        },
      });
  }

  toggleEventType(typeId: string): void {
    if (!this.filters.eventTypeIds) {
      this.filters.eventTypeIds = [];
    }

    const index = this.filters.eventTypeIds.indexOf(typeId);
    if (index === -1) {
      // Create a new array to ensure reference change
      this.filters.eventTypeIds = [...this.filters.eventTypeIds, typeId];
    } else {
      // Create a new array without the removed item
      this.filters.eventTypeIds = this.filters.eventTypeIds.filter(
        (id) => id !== typeId
      );
    }

    this.emitFilters();
  }

  toggleSection(section: keyof typeof this.expandedSections): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  onDateChange(): void {
    this.emitFilters();
  }

  onCityChange(): void {
    this.emitFilters();
  }

  onGuestsChange(): void {
    this.emitFilters();
  }

  onSearchChange(): void {
    this.emitFilters();
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: '',
      eventTypeIds: [],
      fromDate: '',
      toDate: '',
      minGuests: undefined,
      maxGuests: undefined,
      city: '',
    };
    this.resetFilters.emit();
    this.emitFilters();
  }

  applyFilters(): void {
    this.emitFilters();
  }

  private emitFilters(): void {
    // Clean up undefined values and always create a new object
    const cleanFilters: EventFilters = {
      searchTerm: this.filters.searchTerm?.trim() || undefined,
      eventTypeIds: this.filters.eventTypeIds?.length
        ? [...this.filters.eventTypeIds] // Create a new array copy
        : undefined,
      fromDate: this.filters.fromDate || undefined,
      toDate: this.filters.toDate || undefined,
      minGuests: this.filters.minGuests || undefined,
      maxGuests: this.filters.maxGuests || undefined,
      city: this.filters.city?.trim() || undefined,
    };

    this.filterSubject$.next(cleanFilters);
  }
}
