import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout/layout.component';
import { AccessdeniedComponent } from './shared/components/accessdenied/accessdenied.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'sys',
        component: LayoutComponent,
        // canActivate: [authGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('./modules/dashboard/dashboard.routes').then((r) => r.dashboardRoutes)
            },
            {
                path: 'students',
                loadChildren: () => import('./modules/students/students.routes').then((r) => r.studentsRoutes)
            },
            {
                path: 'parents',
                loadChildren: () => import('./modules/parents/parents.routes').then((r) => r.parentsRoutes)
            },

            {
                path: 'staff',
                loadChildren: () => import('./modules/staff/staff.routes').then((r) => r.staffRoutes)
            },
            {
                path: 'access',
                loadChildren: () => import('./modules/access-control/access-control.routes').then((r) => r.accessControlRoutes)
            },
            {
                path: 'payments',
                loadChildren: () => import('./modules/payments/payments.routes').then((r) => r.paymentsRoutes)
            },
            {
                path: 'academics',
                loadChildren: () => import('./modules/academics/academic.routes').then((r) => r.academicRoutes)
            },
            {
                path: 'events',
                loadChildren: () => import('./modules/events/events.routes').then((r) => r.eventsRoutes)
            },
            {
                path: 'settings',
                loadChildren: () => import('./modules/settings/settings.routes').then((r) => r.settingsRoutes)
            },
            {
                path: 'home',
                loadChildren: () => import('./modules/dashboard/dashboard.routes').then((r) => r.dashboardRoutes)
            },
            {
                path: 'notifications',
                loadChildren: () => import('./modules/notifications/notifications.routes').then((r) => r.notificationsRoutes)
            }
        ]
    },
    {
        path: 'auth',
        // canActivate: [noAuthGuard],
        loadChildren: () => import('./auth/auth.routes')
    },
    {
        path: 'mobile',
        loadChildren: () => import('./modules/mobile/mobile.routes').then((r) => r.mobileRoutes)
    },
    { path: 'notfound', component: NotfoundComponent },
    { path: 'denied', component: AccessdeniedComponent },

    { path: '**', redirectTo: '/notfound' }
];
