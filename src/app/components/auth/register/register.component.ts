// src/app/components/auth/register/register.component.ts
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class RegisterComponent {
  user: User = {
    role: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    companyDescription: '',
  };

  confirmPassword: string = '';
  isSubmitting: boolean = false;
  registrationError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // if (this.user.password !== this.confirmPassword) {
    //   return;
    // }

    if (!this.user.role) {
      alert('Please, choose a role');
      return;
    }

    this.isSubmitting = true;
    this.registrationError = '';

    this.authService.register(this.user).subscribe(
      (response) => {
        this.isSubmitting = false;
        if (response.token && response.user) {
          this.router.navigate(['/']);
        } else {
          this.registrationError = '';
        }
      },
      (error) => {
        this.isSubmitting = false;
        this.registrationError = '';
        console.error('Error:', error);
      }
    );
  }
}
