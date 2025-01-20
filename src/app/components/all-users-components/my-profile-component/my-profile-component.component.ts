import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service'


@Component({
  selector: 'app-my-profile-component',
  imports: [CommonModule],
  providers: [AuthService],
  templateUrl: './my-profile-component.component.html',
})
export class MyProfileComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
