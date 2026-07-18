import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ProfileResponse } from '../../services/auth.service';
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
  private router = inject(Router);

  user!: ProfileResponse;

  loading = true;
  error = '';
   editing = false;

  editedUser = {
    name: '',
    email: '',
    avatar: ''
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
    avatar: data.avatar
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

  this.editedUser = {
    name: this.user.name,
    email: this.user.email,
    avatar: this.user.avatar
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
saveProfile(): void {

  this.authService.updateProfile({

    username: this.editedUser.name,
    email: this.editedUser.email,
    avatarUrl: this.editedUser.avatar

  }).subscribe({

    next: (user) => {
      
      this.user = user;
      this.previewImage = user.avatar;
      this.editing = false;

    },

    error: (err) => console.error(err)

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