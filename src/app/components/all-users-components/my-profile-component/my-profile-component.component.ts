import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user/user.service';
import { UserMyProfileResponse } from '../../../types/dto/responses/userMyProfileResponse';

@Component({
  selector: 'app-my-profile-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-profile-component.component.html',
})
export class MyProfileComponent implements OnInit {
  userProfile: UserMyProfileResponse | null = null;
  userRole: string | null = null;
  notificationsEnabled = false;
  selectedPhotoUrl: string | null = null;

  fallbackImage = '../../../../../public/emptyAvatar.png';

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

  editInformation() {}

  changePassword() {}

  deactivateAccount() {}
}
