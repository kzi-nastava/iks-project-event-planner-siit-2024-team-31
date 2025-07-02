import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  /**
   * Show success notification
   */
  success(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Show error notification
   */
  error(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration: 7000, // Show errors longer
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['warning-snackbar'],
    });
  }

  /**
   * Show info notification
   */
  info(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['info-snackbar'],
    });
  }

  /**
   * Show validation error (for form validation)
   */
  validationError(message: string): void {
    this.error(message);
  }

  /**
   * Show authentication error
   */
  authError(message: string): void {
    this.error(`Authentication Error: ${message}`);
  }

  /**
   * Show network error
   */
  networkError(message?: string): void {
    this.error(
      message || 'Please check your internet connection and try again.'
    );
  }

  /**
   * Show session expired error
   */
  sessionExpired(): void {
    this.warning('Your session has expired. Please log in again.');
  }

  /**
   * Clear all snackbars
   */
  clear(): void {
    this.snackBar.dismiss();
  }
}
