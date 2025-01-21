import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password-component.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChangePasswordComponent {
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();

  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  closeModalWindow() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';

    this.closeModal.emit();
  }

  onSubmit() {
    if (this.newPassword !== this.confirmNewPassword) {
      alert('Новые пароли не совпадают!');
      return;
    }

    console.log('Old:', this.oldPassword, 'New:', this.newPassword);

    this.closeModalWindow();
  }
}
