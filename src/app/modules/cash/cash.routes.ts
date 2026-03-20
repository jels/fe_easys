// src/app/modules/access-control/access-control.routes.ts
import { Routes } from '@angular/router';
import { CashComponent } from './cash.component';

export const cashRoutes: Routes = [
    {
        path: '',
        component: CashComponent,
        data: { breadcrumb: 'Libro Caja' }
    }
];
