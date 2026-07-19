import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private mediaService = inject(MediaService);
  private router = inject(Router);
  avatarPreview: string | null = null;
selectedAvatar: File | null = null;
  loading = false;
  error = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['SELLER', Validators.required],
    avatar: ['']
  });
  onAvatarSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  const file = input.files[0];

  this.selectedAvatar = file;

  const reader = new FileReader();

  reader.onload = () => {
    this.avatarPreview = reader.result as string;
  };

  reader.readAsDataURL(file);

}
// registration 
  register(): void {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';

  if (this.selectedAvatar) {

    this.mediaService.uploadImages([this.selectedAvatar]).subscribe({

      next: (urls) => {

        this.registerUser(urls[0]);

      },

      error: (er) => {
        console.log(er)
        this.loading = false;
        this.error = 'Failed to upload avatar.';

      }

    });

  } else {

    this.registerUser('');

  }

}
private registerUser(avatarUrl: string): void {

  const data: RegisterRequest = {

    username: this.form.value.username!,
    email: this.form.value.email!,
    password: this.form.value.password!,
    role: this.form.value.role!,
    avatar: avatarUrl || null

  };

  this.authService.register(data).subscribe({

    next: () => {

      this.loading = false;

      this.router.navigate(['/login']);

    },

    error: (err) => {

      this.loading = false;

      this.error =
        err?.error?.message ??
        'Registration failed. Please try again.';

    }

  });

}

}