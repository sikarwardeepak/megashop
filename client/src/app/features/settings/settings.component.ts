import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  selectedOption: string = 'profile';
  user: any = {};
  profileForm: FormGroup;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router,
    private userService: UserService, private fb: FormBuilder
  ) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }

    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    this.successMessage = '';
    this.errorMessage = '';
  }

  loadUserProfile(): void {
    // Fetch user profile from the server
    this.userService.getUserProfile().subscribe(
      (user) => {
        this.user = user;
        this.profileForm.patchValue({
          email: user.email,
          address: user.address
        });
      },
      (error) => {
        console.error('Error fetching user profile:', error);
        this.errorMessage = 'Unable to load profile. Please try again later.';
      }
    );
  }

  updateProfile(): void {
    console.log(this.profileForm.value)
    if (this.profileForm.valid) {
      const updatedUser = {
        username: this.user.username, 
        email: this.profileForm.value.email,
        address: this.profileForm.value.address
      };
      // Update user profile on the server
      this.userService.updateUserProfile(updatedUser).toPromise()
        .then((response) => {
          this.successMessage = 'Profile updated successfully.';
          this.errorMessage = '';
          console.log('Profile updated successfully:', response);
          this.loadUserProfile();
        })
        .catch((error) => {
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.successMessage = '';
          console.error('Error updating profile:', error);
          this.loadUserProfile();
        });
    } else {
      this.errorMessage = 'Please enter valid email address.';
      this.successMessage = '';
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