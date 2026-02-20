// src/app/modules/staff/staff.routes.ts
import { Routes } from '@angular/router';
import { StaffComponent } from './staff.component';

export const staffRoutes: Routes = [
    {
        path: '',
        component: StaffComponent,
        data: { breadcrumb: 'Personal' }
    }
];
