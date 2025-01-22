import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from '../../../services/user/user.service';
import { UserMyProfileResponse } from '../../../types/dto/responses/userMyProfileResponse';

@Component({
  selector: 'app-edit-profile-form-component',
  imports: [CommonModule],
  providers: [],
  templateUrl: './edit-profile-form-component.component.html',
  standalone: true,
})
export class EditProfileFormComponent {
  constructor() {
    userService: UserService;
  }

  @Input() userProfileData: UserMyProfileResponse | null = null;
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();

  closeModalWindow() {
    this.userProfileData = null;
    this.closeModal.emit();
  }

  onSubmit() {
    console.log('Submit profile data:', this.userProfileData);
  }
}
