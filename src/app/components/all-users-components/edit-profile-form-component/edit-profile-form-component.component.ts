import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PhotoFile, PhotoService } from '../../../services/photo.service';
import { UserService } from '../../../services/user/user.service';
import { UpdateUserDataRequest } from '../../../types/dto/requests/updateUserDataRequest';
import { UserMyProfileResponse } from '../../../types/dto/responses/userMyProfileResponse';
import { Role } from '../../../types/roles';

@Component({
  selector: 'app-edit-profile-form-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile-form-component.component.html',
  standalone: true,
})
export class EditProfileFormComponent implements OnInit, OnChanges, OnDestroy {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private notification = inject(NotificationService);
  private photoService = inject(PhotoService);
  private router = inject(Router);

  tempUser: UserMyProfileResponse | null = null;
  role: Role | null = null;
  removedPhotosIds: number[] = [];
  newPhotos: PhotoFile[] = [];

  @Input() userProfileData: UserMyProfileResponse | null = null;
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<void>();

  // Make Role enum available to template
  protected readonly Role = Role;

  ngOnInit(): void {
    this.role = this.authService.getRole();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userProfileData'] && !changes['userProfileData'].firstChange) {
      this.initializeForm();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.photoService.cleanupPreviews(this.newPhotos);
  }

  initializeForm(): void {
    this.cleanup();
    this.newPhotos = [];

    this.tempUser = {
      email: this.userProfileData?.email || '',
      firstName: this.userProfileData?.firstName || '',
      lastName: this.userProfileData?.lastName || '',
      phoneNumber: this.userProfileData?.phoneNumber || '',
      country: this.userProfileData?.country || '',
      city: this.userProfileData?.city || '',
      zipCode: this.userProfileData?.zipCode || '',
      address: this.userProfileData?.address || '',
      description: this.userProfileData?.description || '',
      tempPhotoUrlAndIdDTOList:
        this.userProfileData?.tempPhotoUrlAndIdDTOList?.map((i) => ({
          ...i,
        })) || [],
      error: this.userProfileData?.error || '',
      message: this.userProfileData?.message || '',
    };
    this.removedPhotosIds = [];
  }

  removePhoto(id: number): void {
    if (this.tempUser?.tempPhotoUrlAndIdDTOList) {
      this.tempUser.tempPhotoUrlAndIdDTOList =
        this.tempUser.tempPhotoUrlAndIdDTOList.filter(
          (photo) => photo.photoId !== id
        );
      this.removedPhotosIds.push(id);
    }
  }

  removeNewPhoto(index: number): void {
    this.newPhotos.splice(index, 1);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    const config = {
      maxFiles: this.role === Role.ROLE_USER ? 1 : 10,
      aspectRatio: this.role === Role.ROLE_USER ? 1 : undefined, // Square aspect ratio for user avatars
      minWidth: this.role === Role.ROLE_USER ? 200 : 800, // Higher resolution for business photos
      minHeight: this.role === Role.ROLE_USER ? 200 : 600,
    };

    try {
      const validatedPhotos = await this.photoService.validateAndProcessPhotos(
        files,
        config
      );

      if (this.role === Role.ROLE_USER && validatedPhotos.length > 0) {
        // For users, replace existing avatar
        if (this.tempUser?.tempPhotoUrlAndIdDTOList?.length) {
          const currentAvatar = this.tempUser.tempPhotoUrlAndIdDTOList[0];
          if (currentAvatar.photoId) {
            this.removedPhotosIds.push(currentAvatar.photoId);
          }
          this.tempUser.tempPhotoUrlAndIdDTOList = [];
        }
        this.cleanup(); // Clean up existing previews
        this.newPhotos = [validatedPhotos[0]]; // Only keep the first photo
      } else {
        // For business accounts, add all validated photos
        this.newPhotos.push(...validatedPhotos);
      }
    } catch (error) {
      console.error('Error processing photos:', error);
      this.notification.error('Failed to process photos. Please try again.');
    }

    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  onSubmit() {
    if (!this.tempUser) return;

    const updateProfileRequest: UpdateUserDataRequest = {
      email: this.tempUser.email,
      firstName: this.tempUser.firstName,
      lastName: this.tempUser.lastName,
      phoneNumber: this.tempUser.phoneNumber,
      country: this.tempUser.country,
      city: this.tempUser.city,
      zipCode: this.tempUser.zipCode,
      address: this.tempUser.address,
      description: this.tempUser.description,
      deletedPhotosIds: this.removedPhotosIds,
    };

    const formData = new FormData();

    Object.entries(updateProfileRequest).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    for (const photo of this.newPhotos) {
      formData.append('photos', photo.file);
    }

    this.userService.updateUserData(formData).subscribe({
      next: (response) => {
        this.notification.success('Profile updated successfully!');
        this.cleanup();
        this.newPhotos = [];
        this.removedPhotosIds = [];
        this.profileUpdated.emit();
        this.closeModal.emit();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notification.error('Error updating profile. Please try again.');
      },
    });
  }

  closeModalWindow(): void {
    // Close the modal window
    const modal = document.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }
}
