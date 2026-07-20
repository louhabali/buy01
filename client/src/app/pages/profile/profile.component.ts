import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ProfileResponse } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private mediaService = inject(MediaService);
  private router = inject(Router);

  // Form setup explicitly matches your ProfileResponse keys now
  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    avatarUrl: [''] ,
    role: ['', [Validators.required]]
  });

  user!: ProfileResponse;
  loading = true;
  error = '';
  editing = false;
  selectedAvatar: File | null = null;
  avatarPreview = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (data: ProfileResponse) => {
        console.log('Loaded Profile Response:', data);
        
        this.user = data;
        
        this.form.patchValue({
          username: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl || 'none' ,
          role: data.role || 'CLIENT'
        });
        
        this.avatarPreview = data.avatarUrl || '';
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = "Cannot load profile";
        this.loading = false;
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedAvatar = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(this.selectedAvatar);
  }

  editProfile() { this.editing = true; }

  cancelEdit() {
    this.editing = false;
    this.selectedAvatar = null;
    this.loadProfile(); // Reset to server state
  }

  saveProfile(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    if (this.selectedAvatar) {
      this.mediaService.uploadImages([this.selectedAvatar]).subscribe({
        next: (urls) => this.updateBackend(urls[0]),
        error: () => {
          this.loading = false;
          this.error = 'Failed to upload avatar.';
        }
      });
    } else {
      this.updateBackend(this.form.getRawValue().avatarUrl);
    }
  }

  private updateBackend(avatarUrl: string): void {
    const values = this.form.getRawValue();
    this.authService.updateProfile({
      username: values.username,
      email: values.email,
      avatarUrl: avatarUrl,
      role: values.role 
    }).subscribe({
      next: (updatedUser: any) => {
        console.log('Updated Profile Response:', updatedUser);
        this.user = updatedUser;
        
        this.form.patchValue({
          username: updatedUser.name || updatedUser.username,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl || '',
          role: updatedUser.role || 'CLIENT'
        });
        
        this.avatarPreview = updatedUser.avatar || updatedUser.avatarUrl || '';
        this.editing = false;
        this.loading = false;
        this.selectedAvatar = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.errorMessage ?? 'Failed to update profile.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}