// src/app/modules/settings/settings.routes.ts
import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const settingsRoutes: Routes = [
    {
        path: '',
        component: SettingsComponent,
        data: { breadcrumb: 'Configuraciones' }
    }
];
