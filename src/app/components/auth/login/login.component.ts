import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class LoginComponent {
  user = {
    email: '',
    password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.user.email, this.user.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error(error);
      },
    });

    console.log('Login attempted:', this.user);
  }
}
