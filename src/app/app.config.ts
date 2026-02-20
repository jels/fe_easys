import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withHashLocation, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

import { registerLocaleData } from '@angular/common';
import localeEsPY from '@angular/common/locales/es-PY';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { MessageService } from 'primeng/api';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),

        provideRouter(
            routes,
            withRouterConfig({
                onSameUrlNavigation: 'ignore'
            }),
            withInMemoryScrolling({
                scrollPositionRestoration: 'top',
                anchorScrolling: 'enabled'
            }),
            withEnabledBlockingInitialNavigation(),
            // withViewTransitions(),
            withHashLocation()
        ),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } }
        }),
        // provideAnimations(),
        provideHttpClient(withInterceptors([authInterceptor])),
        MessageService, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
    ]
};
