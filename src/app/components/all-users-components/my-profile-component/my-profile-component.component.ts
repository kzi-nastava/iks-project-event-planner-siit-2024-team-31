import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user/user.service';
import { UserMyProfileResponse } from '../../../types/dto/responses/userMyProfileResponse';
import { ChangePasswordComponent } from '../change-password-component/change-password-component.component';
import { EditProfileFormComponent } from '../edit-profile-form-component/edit-profile-form-component.component';

@Component({
  selector: 'app-my-profile-component',
  standalone: true,
  imports: [CommonModule, ChangePasswordComponent, EditProfileFormComponent],
  templateUrl: './my-profile-component.component.html',
})
export class MyProfileComponent implements OnInit {
  userProfile: UserMyProfileResponse | null = null;
  userRole: string | null = null;
  notificationsEnabled = false;
  selectedPhotoUrl: string | null = null;

  fallbackImage = 'assets/fallback-image.png';

  showChangePasswordModal = false;
  showEditProfileModal = false;

  //TODO: add user event calendar

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userProfile = response;
        if (
          (this.userRole === 'ROLE_OD' || this.userRole === 'ROLE_PUP') &&
          this.userProfile?.tempPhotoUrlAndIdDTOList?.length
        ) {
          this.selectedPhotoUrl =
            this.userProfile.tempPhotoUrlAndIdDTOList[0].tempPhotoUrl;
        }
        console.log('User profile:', response);
      },
      error: (error) => {
        console.error(error);
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

  deactivateAccount() {
    //for PUP account can be deactivated only if there are no booked services
    //for OD account can be deactivated only if there are no active and upcoming events
    //for USER account can be deactivated only if there are no active and upcoming events
  }
}
