import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, ProfileResponse } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
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

  ngOnInit(): void {

    this.loadProfile();

  }


  loadProfile(): void {

    this.authService.getProfile().subscribe({

      next: (data) => {
        console.log('Profile data loaded:', data);
        this.user = data;
        this.loading = false;

      },

      error: (ee) => {
        console.error('Error loading profile:', ee);
        this.error = "Cannot load profile";
        this.loading = false;

      }

    });

  }


  editProfile(): void {

    this.router.navigate(['/profile/edit']);

  }


  changePassword(): void {

    this.router.navigate(['/profile/password']);

  }


  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}