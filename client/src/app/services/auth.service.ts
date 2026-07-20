import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  avatarUrl?: string;
}
export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
}
export interface JwtPayload {
  sub: string;
  userId: string;
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'token';

  login(data: LoginRequest): Observable<any> {
    console.log('Sending login request with data:', data , 'to URL:', `${environment.authUrl}/login`);
    return this.http.post<any>(
      `${environment.authUrl}/login`,
      data
    ).pipe(

      tap(res => {

        this.saveToken(res.token);

      })

    );

  }
  getProfile() {
    return this.http.get<ProfileResponse>(
        `${environment.authUrl}/profile`
    );
}
updateProfile(profile: {
  username: string;
  email: string;
  avatarUrl: string;
  role : string
}) {

  return this.http.put<ProfileResponse>(
    `${environment.authUrl}/profile`,
    profile
  );

}


  register(data: RegisterRequest): Observable<any> {

    return this.http.post(
      `${environment.authUrl}/register`,
      data
    );

  }

  logout(): void {

    this.removeToken();

  }

  saveToken(token: string): void {

    localStorage.setItem(this.TOKEN_KEY, token);

  }

  getToken(): string | null {

    return localStorage.getItem(this.TOKEN_KEY);

  }

  removeToken(): void {

    localStorage.removeItem(this.TOKEN_KEY);

  }

  isLoggedIn(): boolean {

    const token = this.getToken();

    if (!token) return false;

    try {

      const decoded = jwtDecode<JwtPayload>(token);

      return decoded.exp * 1000 > Date.now();

    } catch {

      return false;

    }

  }

  getDecodedToken(): JwtPayload | null {

    const token = this.getToken();

    if (!token) return null;

    try {

      return jwtDecode<JwtPayload>(token);

    } catch {

      return null;

    }

  }

  getUserId(): string | null {

    return this.getDecodedToken()?.userId ?? null;

  }

  getEmail(): string | null {

    return this.getDecodedToken()?.sub ?? null;

  }

  getRole(): string | null {

    return this.getDecodedToken()?.role ?? null;

  }

}