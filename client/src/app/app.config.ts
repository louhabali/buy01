import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { authInterceptor } from '../interceptors/jwt.interceptor';

import { errorInterceptor } from '../interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [
     provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptors([
        authInterceptor , errorInterceptor
      ])
    )

  ]

};