// src/app/modules/payments/payments.routes.ts
import { Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';

export const paymentsRoutes: Routes = [
    {
        path: '',
        component: PaymentsComponent,
        data: { breadcrumb: 'Pagos y Finanzas' }
    }
];
