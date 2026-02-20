// src/app/modules/notifications/notifications.routes.ts
import { Routes } from '@angular/router';
import { NotificationsComponent } from './notifications.component';

export const notificationsRoutes: Routes = [
    {
        path: '',
        component: NotificationsComponent,
        data: { breadcrumb: 'Notificaciones' }
    }
];
