// src/app/modules/parents/parents.routes.ts
import { Routes } from '@angular/router';
import { ParentsComponent } from './parents.component';

export const parentsRoutes: Routes = [
    {
        path: '',
        component: ParentsComponent,
        data: { breadcrumb: 'Padres y Tutores' }
    }
];
