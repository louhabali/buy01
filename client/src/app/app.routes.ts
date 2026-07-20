import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HomeComponent } from './pages/home/home.component';
import { ErrorComponent } from './pages/error/error.component';
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'profile',
    component: ProfileComponent
  },
  { path: 'unauthorized', component: ErrorComponent, data: { code: '401' } },
  { path: 'forbidden', component: ErrorComponent, data: { code: '403' } },
  { path: 'server-error', component: ErrorComponent, data: { code: '500' } },

  // Wildcard 404 handler block (MUST be placed absolutely last)
  { path: '**', component: ErrorComponent, data: { code: '404' } }

];