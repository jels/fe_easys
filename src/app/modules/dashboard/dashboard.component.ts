// src/app/modules/dashboard/dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EventMock } from '../../shared/data/operations.mock';
import { DashboardAlert, DashboardService, DashboardStats, RecentActivity } from '../../core/services/conf/dashboard.service';

interface QuickAction {
    label: string;
    icon: string;
    route: string;
    color: string;
    bg: string;
    desc: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ButtonModule, SkeletonModule, TagModule, TooltipModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats = signal<DashboardStats | null>(null);
    alerts = signal<DashboardAlert[]>([]);
    activity = signal<RecentActivity[]>([]);
    upcomingEvents = signal<EventMock[]>([]);

    loadingStats = signal(true);
    loadingAlerts = signal(true);
    loadingActivity = signal(true);
    loadingEvents = signal(true);

    readonly quickActions: QuickAction[] = [
        { label: 'Estudiantes', icon: 'pi-users', route: '/sys/students', color: '#2563eb', bg: 'rgba(59,130,246,0.10)', desc: 'Gestión de alumnos' },
        { label: 'Personal', icon: 'pi-briefcase', route: '/sys/staff', color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', desc: 'Docentes y admin' },
        { label: 'Padres/Tutores', icon: 'pi-heart', route: '/sys/parents', color: '#db2777', bg: 'rgba(219,39,119,0.10)', desc: 'Contactos familiares' },
        { label: 'Académico', icon: 'pi-book', route: '/sys/academics', color: '#059669', bg: 'rgba(16,185,129,0.10)', desc: 'Notas y horarios' },
        { label: 'Pagos', icon: 'pi-credit-card', route: '/sys/payments', color: '#d97706', bg: 'rgba(245,158,11,0.10)', desc: 'Cuotas y recibos' },
        { label: 'Acceso', icon: 'pi-shield', route: '/sys/access', color: '#dc2626', bg: 'rgba(220,38,38,0.10)', desc: 'Control de entrada' },
        { label: 'Eventos', icon: 'pi-calendar', route: '/sys/events', color: '#6366f1', bg: 'rgba(99,102,241,0.10)', desc: 'Actividades' },
        { label: 'Configuración', icon: 'pi-cog', route: '/sys/settings', color: '#64748b', bg: 'rgba(100,116,139,0.10)', desc: 'Parámetros del sistema' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private dashboardService: DashboardService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.dashboardService
            .getStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => {
                this.stats.set(s);
                this.loadingStats.set(false);
            });

        this.dashboardService
            .getAlerts()
            .pipe(takeUntil(this.destroy$))
            .subscribe((a) => {
                this.alerts.set(a);
                this.loadingAlerts.set(false);
            });

        this.dashboardService
            .getRecentActivity()
            .pipe(takeUntil(this.destroy$))
            .subscribe((a) => {
                this.activity.set(a);
                this.loadingActivity.set(false);
            });

        this.dashboardService
            .getUpcomingEvents()
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                this.upcomingEvents.set(e);
                this.loadingEvents.set(false);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    getAlertSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            danger: 'danger',
            warn: 'warn',
            info: 'info'
        };
        return m[type] ?? 'secondary';
    }

    getEventStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            PLANNED: 'info',
            ACTIVE: 'success',
            COMPLETED: 'secondary',
            CANCELLED: 'danger'
        };
        return m[s] ?? 'secondary';
    }

    getEventStatusLabel(s: string): string {
        const m: Record<string, string> = {
            PLANNED: 'Planificado',
            ACTIVE: 'Activo',
            COMPLETED: 'Completado',
            CANCELLED: 'Cancelado'
        };
        return m[s] ?? s;
    }

    get currentDate(): string {
        return new Date().toLocaleDateString('es-PY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    get dangerAlerts(): DashboardAlert[] {
        return this.alerts().filter((a) => a.type === 'danger');
    }
    get warnAlerts(): DashboardAlert[] {
        return this.alerts().filter((a) => a.type === 'warn');
    }
    get infoAlerts(): DashboardAlert[] {
        return this.alerts().filter((a) => a.type === 'info');
    }
}
