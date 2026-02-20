// src/app/modules/access-control/access-control.routes.ts
import { Routes } from '@angular/router';
import { AccessControlComponent } from './access-control.component';

export const accessControlRoutes: Routes = [
    {
        path: '',
        component: AccessControlComponent,
        data: { breadcrumb: 'Control de Acceso' }
    }
];
