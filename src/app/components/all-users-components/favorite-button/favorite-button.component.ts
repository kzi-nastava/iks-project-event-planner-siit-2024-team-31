import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FavoritesService } from '../../../services/favorites/favorites.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrl: './favorite-button.component.scss',
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {
  @Input() itemId!: string | number;
  @Input() itemType!: 'event' | 'product' | 'service';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  private destroy$ = new Subject<void>();

  isFavorite = false;
  isLoading = false;

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.subscribeToFavoriteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToFavoriteChanges(): void {
    const numericId = this.convertToNumber(this.itemId);

    switch (this.itemType) {
      case 'event':
        this.favoritesService.favoriteEvents$
          .pipe(takeUntil(this.destroy$))
          .subscribe((favoriteIds) => {
            this.isFavorite = favoriteIds.has(numericId);
          });
        break;
      case 'product':
        this.favoritesService.favoriteProducts$
          .pipe(takeUntil(this.destroy$))
          .subscribe((favoriteIds) => {
            this.isFavorite = favoriteIds.has(numericId);
          });
        break;
      case 'service':
        this.favoritesService.favoriteServices$
          .pipe(takeUntil(this.destroy$))
          .subscribe((favoriteIds) => {
            this.isFavorite = favoriteIds.has(numericId);
          });
        break;
    }
  }

  private convertToNumber(id: string | number): number {
    return typeof id === 'string' ? parseInt(id, 10) : id;
  }

  toggleFavorite(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    const numericId = this.convertToNumber(this.itemId);

    if (this.isFavorite) {
      this.removeFavorite(numericId);
    } else {
      this.addFavorite(numericId);
    }
  }

  private addFavorite(id: number): void {
    let addObservable;

    switch (this.itemType) {
      case 'event':
        addObservable = this.favoritesService.addFavoriteEvent(id);
        break;
      case 'product':
        addObservable = this.favoritesService.addFavoriteProduct(id);
        break;
      case 'service':
        addObservable = this.favoritesService.addFavoriteService(id);
        break;
      default:
        this.isLoading = false;
        return;
    }

    addObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error adding ${this.itemType} to favorites:`, error);
        this.isLoading = false;
      },
    });
  }

  private removeFavorite(id: number): void {
    let removeObservable;

    switch (this.itemType) {
      case 'event':
        removeObservable = this.favoritesService.removeFavoriteEvent(id);
        break;
      case 'product':
        removeObservable = this.favoritesService.removeFavoriteProduct(id);
        break;
      case 'service':
        removeObservable = this.favoritesService.removeFavoriteService(id);
        break;
      default:
        this.isLoading = false;
        return;
    }

    removeObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error removing ${this.itemType} from favorites:`, error);
        this.isLoading = false;
      },
    });
  }
}
