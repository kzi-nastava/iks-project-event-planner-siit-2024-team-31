import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user/user.service';
import { UpdatePasswordRequest } from '../../../types/dto/requests/updatePasswordRequest';
import { CommonMessageResponse } from '../../../types/dto/responses/commonMessageResponse';
import { Role } from '../../../types/roles';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChangePasswordComponent {
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  @Input() showModal = false;
  @Input() userRole: Role | null = null;
  @Output() closeModal = new EventEmitter<void>();

  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  protected readonly Role = Role;

  closeModalWindow() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';

    this.closeModal.emit();
  }

  onSubmit() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.notification.validationError('New passwords do not match!');
      return;
    }

    const request: UpdatePasswordRequest = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    };

    this.userService.updatePassword(request).subscribe({
      next: (response: CommonMessageResponse) => {
        this.notification.success(response.message);
        this.closeModalWindow();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.notification.authError(
            error.error?.error || 'Access is denied.'
          );
        } else {
          this.notification.error(
            error.error?.error || 'Something went wrong.'
          );
        }
      },
    });
  }
}
