import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService , ProfileResponse} from '../../app/services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = 'Curator';
  avatarUrl: string | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.isLoading = true;

    // Call your existing getProfile() method
    this.authService.getProfile().subscribe({
      next: (user: ProfileResponse) => {
        // Map backend 'name' field
        if (user.name) {
          this.username = user.name;
        }

        // Process avatar URL
        if (user.avatarUrl) {
          // If relative path from backend (e.g. /uploads/...), prepend your backend/gateway domain if needed
          this.avatarUrl = user.avatarUrl.startsWith('https') 
            ? user.avatarUrl 
            : `https://localhost:8089${user.avatarUrl}`;
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.warn('Could not fetch backend profile meta:', err);
        const localUser = localStorage.getItem('username');
        if (localUser) {
          this.username = localUser;
        }
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.removeToken();
     localStorage.removeItem('username');
  this.isLoading = false;

    this.router.navigate(['/login']);
  }
}