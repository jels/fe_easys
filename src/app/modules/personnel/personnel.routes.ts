import { Routes } from '@angular/router';

export default [
    {
        path: '',
        loadComponent: () => import('./views/personnel-list/personnel-list.component').then((m) => m.PersonnelListComponent),
        data: { breadcrumb: 'Personal' }
    },
    {
        path: 'nuevo',
        loadComponent: () => import('./views/personnel-form/personnel-form.component').then((m) => m.PersonnelFormComponent),
        data: { breadcrumb: 'Nuevo Personal' }
    },
    {
        path: 'editar/:id',
        loadComponent: () => import('./views/personnel-form/personnel-form.component').then((m) => m.PersonnelFormComponent),
        data: { breadcrumb: 'Editar Personal' }
    },
    {
        path: 'detalle/:id',
        loadComponent: () => import('./views/personnel-detail/personnel-detail.component').then((m) => m.PersonnelDetailComponent),
        data: { breadcrumb: 'Detalle del Personal' }
    }
] as Routes;
