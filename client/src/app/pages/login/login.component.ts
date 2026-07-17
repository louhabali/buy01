import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';

  password = '';

  error = '';

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  login() {

    this.loading = true;

    this.error = '';

    this.authService.login({

      email: this.email,

      password: this.password

    }).subscribe({

      next: (response: any) => {

        this.authService.saveToken(response.token);

        this.router.navigate(['/']);

      },

      error: () => {

        this.loading = false;

        this.error = 'Invalid email or password';

      }

    });

  }

}