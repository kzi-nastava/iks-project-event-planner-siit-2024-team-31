import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  email = '';
  recoveryCode = '';
  newPassword = '';
  confirmPassword = '';

  // Error states
  errorMessage = '';
  isCodeVerified = false;
  codeSent = false;

  // Loading states
  isSendingCode = false;
  isVerifyingCode = false;
  isResettingPassword = false;

  constructor(private authService: AuthService, private router: Router) {
    this.resetStates();
  }

  private resetStates() {
    this.isCodeVerified = false;
    this.codeSent = false;
    this.errorMessage = '';
  }

  private validateEmail(): boolean {
    if (!this.email) {
      this.errorMessage = 'Email is required';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }
    return true;
  }

  private validateRecoveryCode(): boolean {
    if (!this.recoveryCode) {
      this.errorMessage = 'Recovery code is required';
      return false;
    }
    if (this.recoveryCode.length < 6) {
      this.errorMessage = 'Invalid recovery code';
      return false;
    }
    return true;
  }

  private validatePasswords(): boolean {
    if (!this.newPassword) {
      this.errorMessage = 'New password is required';
      return false;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    return true;
  }

  onSubmit() {
    this.verifyCode();
  }

  sendCode() {
    if (!this.validateEmail()) {
      return;
    }

    this.isSendingCode = true;
    this.resetStates();

    this.authService
      .sendRecoveryCode(this.email)
      .pipe(
        finalize(() => {
          this.isSendingCode = false;
        })
      )
      .subscribe({
        next: () => {
          this.codeSent = true;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Failed to send recovery code. Please try again.';
        },
      });
  }

  verifyCode() {
    if (!this.validateEmail() || !this.validateRecoveryCode()) {
      return;
    }

    this.isVerifyingCode = true;
    this.errorMessage = '';

    this.authService
      .verifyRecoveryCode(this.email, this.recoveryCode)
      .pipe(
        finalize(() => {
          this.isVerifyingCode = false;
        })
      )
      .subscribe({
        next: () => {
          this.isCodeVerified = true;
          this.errorMessage = '';
        },
        error: (error) => {
          this.isCodeVerified = false;
          this.errorMessage =
            error?.error?.message || 'Invalid recovery code. Please try again.';
        },
      });
  }

  resetPassword() {
    if (
      !this.validateEmail() ||
      !this.validateRecoveryCode() ||
      !this.validatePasswords()
    ) {
      return;
    }

    this.isResettingPassword = true;
    this.errorMessage = '';

    this.authService
      .resetPassword(this.email, this.recoveryCode, this.newPassword)
      .pipe(
        finalize(() => {
          this.isResettingPassword = false;
        })
      )
      .subscribe({
        next: () => {
          alert('Password reset successfully');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'Failed to reset password. Please try again.';
          this.newPassword = '';
          this.confirmPassword = '';
        },
      });
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
