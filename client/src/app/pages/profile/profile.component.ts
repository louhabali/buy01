import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ProfileResponse } from '../../services/auth.service';
import { MediaService } from '../../services/media.service'; // Added import
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  private authService = inject(AuthService);
  private mediaService = inject(MediaService); // Injected MediaService
  private router = inject(Router);

  user!: ProfileResponse;

  loading = true;
  error = '';
  editing = false;

  editedUser = {
    name: '',
    email: '',
    avatarUrl: ''
  };

  selectedFile?: File;
  previewImage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        console.log('Profile data loaded:', data);
        this.user = data;

        this.editedUser = {
          name: data.name,
          email: data.email,
          avatarUrl: data.avatar    
        };

        this.previewImage = data.avatar;
        this.loading = false;
      },
      error: (ee) => {
        console.error('Error loading profile:', ee);
        this.error = "Cannot load profile";
        this.loading = false;
      }
    });
  }

  editProfile() {
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
    this.selectedFile = undefined; // Clean up selected file on cancel

    this.editedUser = {
      name: this.user.name,
      email: this.user.email,
      avatarUrl: this.user.avatar
    };

    this.previewImage = this.user.avatar;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // Modified saveProfile to use matching registration logic
  saveProfile(): void {
    this.loading = true; // Turn on loader while handling the upload/save sequence
    this.error = '';

    if (this.selectedFile) {
      // 1. Upload the image first if a new file was picked
      this.mediaService.uploadImages([this.selectedFile]).subscribe({
        next: (urls) => {
          // 2. Pass the fresh bucket image URL to your profile updater
          this.updateUserProfile(urls[0]);
        },
        error: (er) => {
          console.error(er);
          this.loading = false;
          this.error = 'Failed to upload profile picture.';
        }
      });
    } else {
      // 1. No new file picked, pass the current, unchanged avatar URL
      this.updateUserProfile(this.editedUser.avatarUrl);
    }
  }

  // Isolated sub-method to carry out final backend persistence payload
  private updateUserProfile(avatarUrl: string): void {
    this.authService.updateProfile({
      username: this.editedUser.name,
      email: this.editedUser.email,
      avatarUrl: avatarUrl
    }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        
        // Re-sync editable values
        this.editedUser = {
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatar
        };
        
        this.previewImage = updatedUser.avatar;
        this.selectedFile = undefined; // Reset state
        this.editing = false;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Failed to update profile information.';
      }
    });
  }

  changePassword(): void {
    this.router.navigate(['/profile/password']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}