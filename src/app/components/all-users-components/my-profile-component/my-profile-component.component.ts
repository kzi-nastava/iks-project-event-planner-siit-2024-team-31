import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user/user.service';
import { UserMyProfileResponse } from '../../../types/dto/responses/userMyProfileResponse';
import { Role } from '../../../types/roles';
import { ChangePasswordComponent } from '../change-password-component/change-password-component.component';
import { EditProfileFormComponent } from '../edit-profile-form-component/edit-profile-form-component.component';
import { EventCalendarComponent } from '../event-calendar/event-calendar.component';
import { FavoritesListsComponent } from '../favorites-lists/favorites-lists.component';

@Component({
  selector: 'app-my-profile-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChangePasswordComponent,
    EditProfileFormComponent,
    EventCalendarComponent,
    FavoritesListsComponent,
  ],
  templateUrl: './my-profile-component.component.html',
})
export class MyProfileComponent implements OnInit, OnChanges {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  userProfile: UserMyProfileResponse | null = null;
  userRole: Role | null = null;
  notificationsEnabled = false;
  selectedPhotoUrl: string | null = null;

  fallbackImage = 'assets/fallback-image.png';

  showChangePasswordModal = false;
  showEditProfileModal = false;
  showDeactivateModal = false;

  // Deactivation form data
  deactivatePassword = '';
  isDeactivating = false;
  deactivateError = '';

  constructor() {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();

    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userProfile = response;
        if (
          (this.userRole === Role.ROLE_OD || this.userRole === Role.ROLE_PUP) &&
          this.userProfile?.tempPhotoUrlAndIdDTOList?.length
        ) {
          this.selectedPhotoUrl =
            this.userProfile.tempPhotoUrlAndIdDTOList[0].tempPhotoUrl;
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  ngOnChanges(): void {}

  refreshUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userProfile = response;
      },
      error: (error) => {
        console.error('Error reloading profile:', error);
      },
    });
  }

  toggleNotifications(): void {
    this.notificationsEnabled = !this.notificationsEnabled;
  }

  selectPhoto(url: string) {
    this.selectedPhotoUrl = url;
  }

  openEditProfileModal() {
    this.showEditProfileModal = true;
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  openDeactivateModal() {
    this.showDeactivateModal = true;
    this.deactivatePassword = '';
    this.deactivateError = '';
  }

  closeDeactivateModal() {
    this.showDeactivateModal = false;
    this.deactivatePassword = '';
    this.deactivateError = '';
    this.isDeactivating = false;
  }

  deactivateAccount() {
    if (!this.deactivatePassword.trim()) {
      this.deactivateError =
        'Please enter your password to confirm deactivation.';
      return;
    }

    // Check role-specific restrictions
    if (this.userRole === Role.ROLE_PUP) {
      // For PUP account can be deactivated only if there are no booked services
      // TODO: Add check for booked services
    } else if (this.userRole === Role.ROLE_OD) {
      // For OD account can be deactivated only if there are no active and upcoming events
      // TODO: Add check for active/upcoming events
    } else if (this.userRole === Role.ROLE_USER) {
      // For USER account can be deactivated only if there are no active and upcoming events
      // TODO: Add check for active/upcoming events
    }

    this.isDeactivating = true;
    this.deactivateError = '';

    this.authService.deactivateAccount(this.deactivatePassword).subscribe({
      next: () => {
        // Successful deactivation
        this.notification.success('Your account has been successfully deactivated. You will be logged out.');
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isDeactivating = false;
        if (error.status === 401) {
          this.deactivateError = 'Incorrect password. Please try again.';
        } else if (error.status === 400) {
          this.deactivateError =
            error.error?.message ||
            'Cannot deactivate account. You may have active bookings or events.';
        } else {
          this.deactivateError =
            'An error occurred while deactivating your account. Please try again.';
        }
        console.error('Deactivation error:', error);
      },
    });
  }

  protected readonly Role = Role;
}
