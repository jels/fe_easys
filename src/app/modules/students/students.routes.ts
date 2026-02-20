// src/app/modules/students/students.routes.ts
import { Routes } from '@angular/router';
import { StudentsComponent } from './students.component';

export const studentsRoutes: Routes = [
    {
        path: '',
        component: StudentsComponent,
        data: { breadcrumb: 'Estudiantes' }
    }
];
