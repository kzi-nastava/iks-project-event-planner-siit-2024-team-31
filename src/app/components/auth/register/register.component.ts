import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { RegisterResponse } from '../../../types/dto/responses/registerResponse';
import { Role } from '../../../types/roles';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  // User object with all the fields
  user = {
    role: Role.ROLE_USER,
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: {
      country: '',
      city: '',
      street: '',
      zipCode: '',
    },
    phoneNumber: '',
    description: '',
  };

  // Confirmation password field
  confirmPassword: string = '';

  // For UI state and displaying errors
  isSubmitting: boolean = false;
  registrationError: string = '';

  filesForUpload: File[] = [];
  previewUrls: string[] = [];

  onSubmit() {
    // Check password confirmation
    if (this.user.password !== this.confirmPassword) {
      this.notification.validationError('Passwords do not match');
      return;
    }

    // Role must be selected
    if (!this.user.role) {
      this.notification.validationError('Please, choose a role');
      return;
    }

    this.isSubmitting = true;
    this.registrationError = '';

    // 1) Create a FormData object
    const formData = new FormData();

    // 2) Append text fields
    formData.append('role', this.user.role);
    formData.append('email', this.user.email);
    formData.append('password', this.user.password);
    formData.append('firstName', this.user.firstName || '');
    formData.append('lastName', this.user.lastName || '');
    formData.append('phoneNumber', this.user.phoneNumber || '');

    // Address
    formData.append('country', this.user.address.country || '');
    formData.append('city', this.user.address.city || '');
    formData.append('address', this.user.address.street || '');
    formData.append('zipCode', this.user.address.zipCode || '');

    // Description (for PUP)
    if (this.user.description) {
      formData.append('description', this.user.description);
    }

    // 3) Append files
    this.filesForUpload.forEach((file) => {
      formData.append('photos', file);
    });

    this.authService.register(formData).subscribe(
      (response: RegisterResponse) => {
        this.isSubmitting = false;

        if (response.exception) {
          this.registrationError = response.exception;
        } else {
          this.notification.success(response.message);
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.registrationError = 'Registration failed.';
        this.notification.error('Registration failed. Please try again.');
        console.error('Error:', error);
      }
    );
  }

  /**
   * If ROLE_USER is allowed only one file (avatar),
   * we handle that here.
   */
  onFileSelectedSingle(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // Reset arrays
    this.previewUrls = [];
    this.filesForUpload = [];

    // Store the file
    this.filesForUpload.push(file);

    // Create a preview for the UI (optional)
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const dataUrl = e.target.result;
      this.previewUrls.push(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  /**
   * If ROLE_OD or ROLE_PUP can upload multiple files,
   * we handle them here.
   */
  onFilesSelectedMultiple(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Reset arrays
    this.previewUrls = [];
    this.filesForUpload = [];

    Array.from(files).forEach((file: File) => {
      this.filesForUpload.push(file);

      // Create a preview for the UI (optional)
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataUrl = e.target.result;
        this.previewUrls.push(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Removes one image from the preview and from the file array.
   */
  removePicture(index: number): void {
    this.previewUrls.splice(index, 1);
    this.filesForUpload.splice(index, 1);
  }

  protected readonly Role = Role;
}
