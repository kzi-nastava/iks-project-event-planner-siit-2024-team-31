import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { FavoritesService } from '../../../services/favorites/favorites.service';
import { TempPhotoUrlAndIdDTO } from '../../../types/dto/tempPhotoUrlAndIdDTO';
import { Page } from '../../../types/page';
import { Role } from '../../../types/roles';

interface FavoriteItem {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  startDate?: string;
  // For events - new structure
  photos?: TempPhotoUrlAndIdDTO[];
  // For products and services - old structure
  imageUrls?: string[];
}

@Component({
  selector: 'app-favorites-lists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites-lists.component.html',
  styleUrl: './favorites-lists.component.scss',
})
export class FavoritesListsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Role enum for template
  Role = Role;

  // Current user role
  currentRole: Role | null = null;

  // Favorites data
  favoriteEvents: FavoriteItem[] = [];
  favoriteProducts: FavoriteItem[] = [];
  favoriteServices: FavoriteItem[] = [];

  // Loading states
  isLoadingEvents = false;
  isLoadingProducts = false;
  isLoadingServices = false;

  // View modes for different sections
  eventViewMode: 'grid' | 'list' = 'grid';
  productViewMode: 'grid' | 'list' = 'grid';
  serviceViewMode: 'grid' | 'list' = 'grid';

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUserRole();
    this.loadFavorites();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCurrentUserRole(): void {
    this.currentRole = this.authService.getRole();
  }

  private loadFavorites(): void {
    this.loadFavoriteEvents();

    // Only load products and services for OD role
    if (this.currentRole === Role.ROLE_OD) {
      this.loadFavoriteProducts();
      this.loadFavoriteServices();
    }
  }

  private loadFavoriteEvents(): void {
    this.isLoadingEvents = true;
    this.favoritesService
      .getFavoriteEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Page<any>) => {
          this.favoriteEvents = response.content || [];
          this.isLoadingEvents = false;
        },
        error: (error) => {
          console.error('Error loading favorite events:', error);
          this.favoriteEvents = [];
          this.isLoadingEvents = false;
        },
      });
  }

  private loadFavoriteProducts(): void {
    this.isLoadingProducts = true;
    this.favoritesService
      .getFavoriteProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Page<any>) => {
          this.favoriteProducts = response.content || [];
          this.isLoadingProducts = false;
        },
        error: (error) => {
          console.error('Error loading favorite products:', error);
          this.favoriteProducts = [];
          this.isLoadingProducts = false;
        },
      });
  }

  private loadFavoriteServices(): void {
    this.isLoadingServices = true;
    this.favoritesService
      .getFavoriteServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Page<any>) => {
          this.favoriteServices = response.content || [];
          this.isLoadingServices = false;
        },
        error: (error) => {
          console.error('Error loading favorite services:', error);
          this.favoriteServices = [];
          this.isLoadingServices = false;
        },
      });
  }

  // View mode toggle methods
  toggleEventView(): void {
    this.eventViewMode = this.eventViewMode === 'grid' ? 'list' : 'grid';
  }

  toggleProductView(): void {
    this.productViewMode = this.productViewMode === 'grid' ? 'list' : 'grid';
  }

  toggleServiceView(): void {
    this.serviceViewMode = this.serviceViewMode === 'grid' ? 'list' : 'grid';
  }

  // TrackBy functions for performance
  trackByEventId(index: number, item: FavoriteItem): string | number {
    return item.id;
  }

  trackByProductId(index: number, item: FavoriteItem): string | number {
    return item.id;
  }

  trackByServiceId(index: number, item: FavoriteItem): string | number {
    return item.id;
  }

  // Helper method to convert ID to number
  private convertToNumber(id: string | number): number {
    return typeof id === 'string' ? parseInt(id, 10) : id;
  }

  // Remove methods
  removeFavoriteEvent(eventId: string | number): void {
    const numericId = this.convertToNumber(eventId);
    this.favoritesService
      .removeFavoriteEvent(numericId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.favoriteEvents = this.favoriteEvents.filter(
            (event) => event.id !== eventId
          );
        },
        error: (error) => {
          console.error('Error removing favorite event:', error);
        },
      });
  }

  removeFavoriteProduct(productId: string | number): void {
    const numericId = this.convertToNumber(productId);
    this.favoritesService
      .removeFavoriteProduct(numericId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.favoriteProducts = this.favoriteProducts.filter(
            (product) => product.id !== productId
          );
        },
        error: (error) => {
          console.error('Error removing favorite product:', error);
        },
      });
  }

  removeFavoriteService(serviceId: string | number): void {
    const numericId = this.convertToNumber(serviceId);
    this.favoritesService
      .removeFavoriteService(numericId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.favoriteServices = this.favoriteServices.filter(
            (service) => service.id !== serviceId
          );
        },
        error: (error) => {
          console.error('Error removing favorite service:', error);
        },
      });
  }

  // Helper methods for photo handling
  hasItemImages(item: any): boolean {
    // For events - use new photos structure
    if (item.photos !== undefined) {
      return !!(item.photos && item.photos.length > 0);
    }
    // For products and services - use old imageUrls structure
    return !!(item.imageUrls && item.imageUrls.length > 0);
  }

  getItemFirstImageUrl(item: any): string | null {
    // For events - use new photos structure
    if (item.photos !== undefined && item.photos.length > 0) {
      return item.photos[0].tempPhotoUrl;
    }
    // For products and services - use old imageUrls structure
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    return null;
  }
}
