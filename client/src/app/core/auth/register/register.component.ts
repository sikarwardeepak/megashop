import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  currentStep: number = 1;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  nextStep(): void {
    this.currentStep = 2;
  }

  previousStep(): void {
    this.currentStep = 1;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const user = this.registerForm.value;
      try {
        // Convert Observable to Promise for async/await
        const response = await this.authService.register(user);
        // Handle successful registration
        // this.toastService.showSuccess('Registration successful! Please log in.');
        this.errorMessage = '';
        this.router.navigate(['/login']);
      } catch (error: any) {
        // Assign error message based on error response
        if (error.status === 500) {
          this.errorMessage = 'Internal server error. Please try again later.';
        }
        else if (error && error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
        console.error('Registration Error:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}