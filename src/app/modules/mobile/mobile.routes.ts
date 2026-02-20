// src/app/modules/mobile/mobile.routes.ts
import { Routes } from '@angular/router';

export const mobileRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('../mobile/mobile-home/mobile-home.component').then((c) => c.MobileHomeComponent)
    },
    {
        path: 'scanner/:mode',
        loadComponent: () => import('../mobile/qr-scanner/qr-scanner.component').then((c) => c.QrScannerComponent)
    },
    // Fallback
    { path: '**', redirectTo: '' }
];
