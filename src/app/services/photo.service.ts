import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationService } from './notification.service';

export interface PhotoValidationConfig {
  maxSizeBytes?: number;
  maxFiles?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

export interface PhotoFile {
  file: File;
  preview: SafeUrl;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly DEFAULT_MAX_FILES = 10;
  private readonly DEFAULT_MIN_WIDTH = 200;
  private readonly DEFAULT_MIN_HEIGHT = 200;
  private readonly DEFAULT_MAX_WIDTH = 4096;
  private readonly DEFAULT_MAX_HEIGHT = 4096;

  constructor(
    private sanitizer: DomSanitizer,
    private notification: NotificationService
  ) {}

  async validateAndProcessPhotos(
    files: File[],
    config: PhotoValidationConfig = {}
  ): Promise<PhotoFile[]> {
    const {
      maxSizeBytes = this.DEFAULT_MAX_SIZE,
      maxFiles = this.DEFAULT_MAX_FILES,
      minWidth = this.DEFAULT_MIN_WIDTH,
      minHeight = this.DEFAULT_MIN_HEIGHT,
      maxWidth = this.DEFAULT_MAX_WIDTH,
      maxHeight = this.DEFAULT_MAX_HEIGHT,
      aspectRatio,
    } = config;

    // Check number of files
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`);
    }

    const validatedPhotos: PhotoFile[] = [];

    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        throw new Error(
          `File ${file.name} exceeds maximum size of ${
            maxSizeBytes / 1024 / 1024
          }MB`
        );
      }

      // Create preview URL
      const preview = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(file)
      );

      // Load image to check dimensions
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Check dimensions
          if (img.width < minWidth || img.height < minHeight) {
            reject(
              new Error(
                `Image ${file.name} is too small. Minimum dimensions are ${minWidth}x${minHeight}px`
              )
            );
          }
          if (img.width > maxWidth || img.height > maxHeight) {
            reject(
              new Error(
                `Image ${file.name} is too large. Maximum dimensions are ${maxWidth}x${maxHeight}px`
              )
            );
          }

          // Check aspect ratio if specified
          if (aspectRatio) {
            const imageRatio = img.width / img.height;
            const tolerance = 0.01; // Allow 1% deviation
            if (Math.abs(imageRatio - aspectRatio) > tolerance) {
              reject(
                new Error(
                  `Image ${file.name} does not match required aspect ratio of ${aspectRatio}`
                )
              );
            }
          }

          resolve();
        };
        img.onerror = () =>
          reject(new Error(`Failed to load image ${file.name}`));
        img.src = URL.createObjectURL(file);
      });

      validatedPhotos.push({ file, preview });
    }

    return validatedPhotos;
  }

  cleanupPreviews(photos: PhotoFile[]): void {
    photos.forEach((photo) => {
      const url = this.sanitizer.sanitize(4, photo.preview);
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
  }
}
