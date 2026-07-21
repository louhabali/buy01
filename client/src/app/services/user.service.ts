import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Purely in-memory state — no localStorage storage
  private userSubject = new BehaviorSubject<ProfileResponse | null>(null);
  public user$: Observable<ProfileResponse | null> = this.userSubject.asObservable();

  constructor() {}

  // Synchronous snapshot getter
  public get currentUser(): ProfileResponse | null {
    return this.userSubject.value;
  }

  // Updates in-memory state and notifies all subscribers
  public setUser(userData: Partial<ProfileResponse>): void {
    const current = this.userSubject.value || {} as ProfileResponse;
    const updated = { ...current, ...userData } as ProfileResponse;

    this.userSubject.next(updated);
  }

  // Clears in-memory state on logout
  public clearUser(): void {
    this.userSubject.next(null);
  }
}