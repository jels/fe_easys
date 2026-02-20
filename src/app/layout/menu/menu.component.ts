import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/api/auth.service';
import { MenuitemComponent } from '../menuitem/menuitem.component';

@Component({
    selector: 'app-menu',
    imports: [MenuitemComponent, RouterModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuComponent {
    model: MenuItem[] = [];
    private authService = inject(AuthService);

    rolUser = this.authService.getUserRoles();

    constructor() {}

    haveRole(role: string): boolean {
        return this.rolUser.includes(role);
    }

    ngOnInit() {
        this.model = [
            {
                label: 'DASHBOARD',
                // icon: 'pi-home',
                visible: true,
                items: [
                    {
                        label: 'Inicio',
                        icon: 'pi pi-fw pi-home',
                        routerLink: '/sys/'
                    }
                ]
            },
            {
                label: 'ADMINISTRACION',
                items: [
                    {
                        label: 'Control de Acceso',
                        icon: 'pi pi-fw pi-lock-open',
                        // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.TEACHER]),
                        items: [
                            {
                                label: 'Accesos',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: '/sys/access'
                            }
                            // {
                            //     label: 'Registrar Salida',
                            //     icon: 'pi pi-fw pi-sign-out'
                            //     // routerLink: '/access-control/register-exit'
                            // },
                            // {
                            //     label: 'Historial',
                            //     icon: 'pi pi-fw pi-history'
                            //     // routerLink: '/access-control/history'
                            // },
                            // {
                            //     label: 'Escáner QR',
                            //     icon: 'pi pi-fw pi-qrcode'
                            //     // routerLink: '/access-control/qr-scanner'
                            // },
                            // {
                            //     label: 'Ausentes',
                            //     icon: 'pi pi-fw pi-user-minus',
                            //     // routerLink: '/access-control/absent-students',
                            //     badge: '5',
                            //     badgeClass: 'badge-warning'
                            // }
                        ]
                    },
                    {
                        label: 'Estudiantes',
                        icon: 'pi pi-fw pi-users',
                        // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.TEACHER]),
                        items: [
                            {
                                label: 'Gestionar Estudiantes',
                                icon: 'pi pi-fw pi-list',
                                routerLink: '/sys/students'
                            }
                        ]
                    },
                    {
                        label: 'Padres',
                        icon: 'pi pi-fw pi-users',
                        // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.TEACHER]),
                        items: [
                            {
                                label: 'Gestionar Padres',
                                icon: 'pi pi-fw pi-list',
                                routerLink: '/sys/parents'
                            }
                        ]
                    },
                    {
                        label: 'Personal',
                        icon: 'pi pi-fw pi-id-card',
                        // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE]),
                        items: [
                            {
                                label: 'Gestionar Personal',
                                icon: 'pi pi-fw pi-list',
                                routerLink: '/sys/staff'
                            }
                            // {
                            //     label: 'Nuevo Personal',
                            //     icon: 'pi pi-fw pi-user-plus'
                            //     // routerLink: '/personnel/create'
                            // },
                            // {
                            //     label: 'Asistencia',
                            //     icon: 'pi pi-fw pi-calendar-times'
                            //     // routerLink: '/personnel/attendance'
                            // }
                        ]
                    }
                    // {
                    //     label: 'Salidas',
                    //     icon: 'pi pi-fw pi-directions',
                    //     routerLink: '/departures',
                    //     // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.TEACHER]),
                    //     items: [
                    //         {
                    //             label: 'Registrar Salida',
                    //             icon: 'pi pi-fw pi-plus'
                    //             // routerLink: '/departures/register'
                    //         },
                    //         {
                    //             label: 'Lista de Salidas',
                    //             icon: 'pi pi-fw pi-list'
                    //             // routerLink: '/departures/list'
                    //         }
                    //     ]
                    // }
                ]
            },

            {
                label: 'ACADEMICO',
                items: [
                    {
                        label: 'Gestionar: ',
                        icon: 'pi pi-fw pi-lock-open',
                        // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE, UserRole.TEACHER]),
                        items: [
                            {
                                label: 'Faltas',
                                icon: 'pi pi-fw pi-exclamation-triangle',
                                items: [
                                    {
                                        label: 'Registrar Falta',
                                        icon: 'pi pi-fw pi-plus'
                                        // routerLink: '/academics/faults/register'
                                    },
                                    {
                                        label: 'Lista de Faltas',
                                        icon: 'pi pi-fw pi-list'
                                        // routerLink: '/academics/faults/list'
                                    }
                                ]
                            },
                            {
                                label: 'Calificaciones',
                                icon: 'pi pi-fw pi-star',
                                items: [
                                    {
                                        label: 'Notas',
                                        icon: 'pi pi-fw pi-plus',
                                        routerLink: '/sys/academics'
                                    }
                                    // {
                                    //     label: 'Lista de Notas',
                                    //     icon: 'pi pi-fw pi-list'
                                    //     // routerLink: '/academics/grades/list'
                                    // },
                                    // {
                                    //     label: 'Reporte Semestral',
                                    //     icon: 'pi pi-fw pi-file-pdf'
                                    //     // routerLink: '/academics/grades/semester-report'
                                    // }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'FINANCIERO',
                // icon: 'pi-dollar',
                // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE]),
                items: [
                    {
                        label: 'Pagos',
                        icon: 'pi pi-fw pi-dollar',
                        items: [
                            {
                                label: 'Gestionar Pagos',
                                icon: 'pi pi-fw pi-plus',
                                routerLink: '/sys/payments'
                            }
                            // {
                            //     label: 'Lista de Pagos',
                            //     icon: 'pi pi-fw pi-list'
                            //     // routerLink: '/payments/list'
                            // },
                            // {
                            //     label: 'Pendientes',
                            //     icon: 'pi pi-fw pi-clock'
                            //     // routerLink: '/payments/pending',
                            //     // badge: '12',
                            //     // badgeClass: 'badge-info'
                            // },
                            // {
                            //     label: 'Vencidos',
                            //     icon: 'pi pi-fw pi-exclamation-circle'
                            //     // routerLink: '/payments/overdue',
                            //     // badge: '3',
                            //     // badgeClass: 'badge-danger'
                            // }
                        ]
                    }
                ]
            },
            {
                label: 'NOTIFICACIONES',
                // icon: 'pi-book',
                // visible: this.hasAccess([UserRole.ADMIN, UserRole.TEACHER]),
                items: [
                    {
                        label: 'Gestionar Notificaciones',
                        icon: 'pi pi-fw pi-bell',
                        routerLink: '/sys/notifications'
                        // visible: true
                    },
                    {
                        label: 'Gestionar Eventos',
                        icon: 'pi pi-fw pi-bell',
                        routerLink: '/sys/events'
                        // visible: true
                    }
                ]
            },
            {
                label: 'Reportes',
                icon: 'pi pi-fw pi-chart-bar',
                // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE]),
                items: [
                    {
                        label: 'Accesos',
                        icon: 'pi pi-fw pi-chart-line'
                        // routerLink: '/reports/access'
                    },
                    {
                        label: 'Académicos',
                        icon: 'pi pi-fw pi-chart-pie'
                        // routerLink: '/reports/academic'
                    },
                    {
                        label: 'Pagos',
                        icon: 'pi pi-fw pi-money-bill'
                        // routerLink: '/reports/payment'
                    },
                    {
                        label: 'General',
                        icon: 'pi pi-fw pi-file'
                        // routerLink: '/reports/general'
                    }
                ]
            },
            {
                label: 'CONFIGURACION',
                icon: 'pi pi-fw pi-chart-bar',
                // visible: this.hasAccess([UserRole.ADMIN, UserRole.ADMINISTRATIVE]),
                items: [
                    {
                        label: 'Ajustes',
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: '/sys/settings'
                    }
                ]
            }
        ];
    }
}
