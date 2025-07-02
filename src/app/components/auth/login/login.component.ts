import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = {
    email: '',
    password: '',
  };

  errorMessage = '';

  onSubmit() {
    // Clear any previous error message
    this.errorMessage = '';

    this.authService.login(this.user.email, this.user.password).subscribe({
      next: () => {
        console.log('Login successful');
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Login error:', error);

        // Handle different types of authentication errors
        if (error.status === 401) {
          const errorMessage = error.error?.error || error.error?.message || '';

          if (
            errorMessage.includes('Bad Credentials') ||
            errorMessage.includes('Invalid credentials')
          ) {
            this.errorMessage = 'Invalid login or password';
          } else if (
            errorMessage.includes('Account is disabled') ||
            errorMessage.includes('disabled')
          ) {
            this.errorMessage = 'Account disabled. Contact support';
          } else if (
            errorMessage.includes('Account is locked') ||
            errorMessage.includes('locked')
          ) {
            this.errorMessage = 'Account locked. Try again later';
          } else {
            this.errorMessage = 'Invalid login or password';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'No connection to server';
        } else if (error.status >= 500) {
          this.errorMessage = 'Invalid login or password';
        } else if (error.status === 400) {
          this.errorMessage = 'Check email and password format';
        } else {
          this.errorMessage = 'Invalid login or password';
        }
      },
    });
  }
}
