import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RegisterResponse } from '../../../types/dto/responses/registerResponse';
import { User } from '../../../types/models/user.model';
import { Role } from '../../../types/roles';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class RegisterComponent {
  /**
   * Main user data (text fields).
   * In your code, "pictures" can be ignored if you're not using base64 on the frontend,
   * but we'll keep it for demonstration purposes.
   */
  user: User = {
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

  // Used if ROLE_PUP requires company name and description
  companyName?: string;
  companyDescription?: string;

  // Confirmation password field
  confirmPassword: string = '';

  // For UI state and displaying errors
  isSubmitting: boolean = false;
  registrationError: string = '';

  /**
   * An array to store selected files (type File).
   * These files will be appended to FormData and sent to the backend.
   */
  filesForUpload: File[] = [];

  /**
   * An array of preview URLs (base64 or data URLs) for displaying images on the frontend.
   */
  previewUrls: string[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Submits the form: builds a FormData object with all the fields and files,
   * and then sends it to the backend.
   */
  onSubmit() {
    // Check password confirmation
    if (this.user.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Role must be selected
    if (!this.user.role) {
      alert('Please, choose a role');
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

    // 4) Make the request
    this.authService.register(formData).subscribe(
      (response: RegisterResponse) => {
        this.isSubmitting = false;

        if (response.exception) {
          // If there is an error from the backend
          this.registrationError = response.exception;
        } else {
          // Successful registration
          alert(response.message);
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.registrationError = 'Registration failed.';
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
}
