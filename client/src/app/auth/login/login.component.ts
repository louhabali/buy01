import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  login(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const request: LoginRequest = {
  email: this.form.value.email!,
  password: this.form.value.password!
};

this.authService.login(request).subscribe({

  next: (response) => {
      this.loading = false;
    console.log('Login successful:', response);
  this.authService.saveToken(response.token);

  this.router.navigate(['/']);
  },

  error: (err) => {
    this.loading = false;
    this.error = err?.error?.message || 'Invalid email or password';
  }

});

  }

}