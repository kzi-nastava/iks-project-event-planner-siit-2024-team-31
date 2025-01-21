import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-my-profile-component',
  imports: [CommonModule],
  templateUrl: './my-profile-component.component.html',
})
export class MyProfileComponent {
  constructor(private userService: UserService, private router: Router) {}

  getUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        console.log('User profile:', response);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
