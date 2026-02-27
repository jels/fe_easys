// src/app/modules/chat/chat.routes.ts
import { Routes } from '@angular/router';

export const chatRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./chat.component').then((m) => m.ChatComponent),
        data: { breadcrumb: 'Mensajería' }
    }
];
