import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  updatePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    this.authService
      .changePassword(this.currentPassword, this.newPassword)
      .then(() => {
        this.successMessage = 'Password updated successfully.';
        this.errorMessage = '';
        // Reset form fields
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      })
      .catch((error) => {
        this.errorMessage =
          error.response?.data?.message || 'Error updating password.';
        this.successMessage = '';
      });
  }
}