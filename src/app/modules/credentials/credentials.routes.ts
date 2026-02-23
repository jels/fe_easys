// src/app/modules/credentials/credentials.routes.ts
import { Routes } from '@angular/router';
import { CredentialsComponent } from './credentials.component';

export const credentialsRoutes: Routes = [
    {
        path: '',
        component: CredentialsComponent,
        data: { breadcrumb: 'Credenciales' }
    }
];
