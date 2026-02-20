// src/app/modules/academic/academic.routes.ts
import { Routes } from '@angular/router';
import { AcademicComponent } from './academic.component';

export const academicRoutes: Routes = [
    {
        path: '',
        component: AcademicComponent,
        data: { breadcrumb: 'Académico' }
    }
];
