import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../app/services/auth.service';
import { UserService } from '../../app/services/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private userSub!: Subscription;

  username: string = 'Curator';
  avatarUrl: string | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    // Subscribe to memory stream
    this.userSub = this.userService.user$.subscribe((user) => {
      if (user?.name) {
        this.username = user.name;
      }
      if (user?.avatarUrl) {
        this.avatarUrl = user.avatarUrl.startsWith('http') 
          ? user.avatarUrl 
          : `https://localhost:8443${user.avatarUrl}`;
      } else {
        this.avatarUrl = null;
      }
    });

    // Fetch fresh profile from server on boot
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('Could not fetch backend profile:', err);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}