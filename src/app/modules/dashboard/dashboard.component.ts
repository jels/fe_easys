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

// Services
import { DashboardService } from '../../core/services/api/dashboard.service';
import { EventsService } from '../../core/services/api/events.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { DashboardStatsResponse } from '../../core/models/dashboard.models';
import { EventResponse } from '../../core/models/events.models';

// ── Tipos locales (reemplazan los mocks del service anterior) ─────────────────

export interface DashboardAlert {
    type: 'danger' | 'warn' | 'info';
    icon: string;
    title: string;
    message: string;
}

export interface RecentActivity {
    icon: string;
    color: string;
    title: string;
    detail: string;
    time: string;
}

interface QuickAction {
    label: string;
    icon: string;
    route: string;
    color: string;
    bg: string;
    desc: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ButtonModule, SkeletonModule, TagModule, TooltipModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
    stats = signal<DashboardStatsResponse | null>(null);
    alerts = signal<DashboardAlert[]>([]);
    activity = signal<RecentActivity[]>([]);
    upcomingEvents = signal<EventResponse[]>([]);

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
        private eventsService: EventsService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        // Una sola llamada al backend para todas las stats
        this.dashboardService
            .getStats(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.stats.set(res.data);
                        this.alerts.set(this.buildAlerts(res.data));
                        this.activity.set(this.buildActivity(res.data));
                    }
                    this.loadingStats.set(false);
                    this.loadingAlerts.set(false);
                    this.loadingActivity.set(false);
                },
                error: () => {
                    this.loadingStats.set(false);
                    this.loadingAlerts.set(false);
                    this.loadingActivity.set(false);
                }
            });

        // Eventos próximos — rango de los próximos 30 días
        const today = new Date();
        const in30days = new Date(today);
        in30days.setDate(today.getDate() + 30);
        const dateFrom = today.toISOString().split('T')[0];
        const dateTo = in30days.toISOString().split('T')[0];

        this.eventsService
            .getEvents(idCompany, { dateFrom, dateTo, size: 5 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.upcomingEvents.set(res.success ? (res.data?.content ?? []) : []);
                    this.loadingEvents.set(false);
                },
                error: () => this.loadingEvents.set(false)
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Builders client-side ──────────────────────────────────────────────────

    private buildAlerts(s: DashboardStatsResponse): DashboardAlert[] {
        const alerts: DashboardAlert[] = [];

        if (s.overdueCount > 0) {
            alerts.push({
                type: 'danger',
                icon: 'pi pi-exclamation-circle',
                title: 'Cuotas vencidas',
                message: `${s.overdueCount} cuota${s.overdueCount > 1 ? 's' : ''} sin cobrar`
            });
        }
        if (s.criticalInfractions > 0) {
            alerts.push({
                type: 'danger',
                icon: 'pi pi-ban',
                title: 'Infracciones críticas',
                message: `${s.criticalInfractions} infracción${s.criticalInfractions > 1 ? 'es' : ''} pendiente${s.criticalInfractions > 1 ? 's' : ''} de resolución`
            });
        }
        if (s.attendanceRate < 80) {
            alerts.push({
                type: 'warn',
                icon: 'pi pi-user-minus',
                title: 'Asistencia baja',
                message: `Tasa de asistencia hoy: ${s.attendanceRate.toFixed(1)}%`
            });
        }
        if (s.pendingNotifications > 0) {
            alerts.push({
                type: 'warn',
                icon: 'pi pi-bell',
                title: 'Notificaciones pendientes',
                message: `${s.pendingNotifications} notificación${s.pendingNotifications > 1 ? 'es' : ''} sin enviar`
            });
        }
        if (s.upcomingEvents > 0) {
            alerts.push({
                type: 'info',
                icon: 'pi pi-calendar',
                title: 'Eventos próximos',
                message: `${s.upcomingEvents} evento${s.upcomingEvents > 1 ? 's' : ''} programado${s.upcomingEvents > 1 ? 's' : ''} esta semana`
            });
        }
        if (s.earlyDeparturesToday > 0) {
            alerts.push({
                type: 'info',
                icon: 'pi pi-sign-out',
                title: 'Retiros anticipados',
                message: `${s.earlyDeparturesToday} alumno${s.earlyDeparturesToday > 1 ? 's' : ''} retirado${s.earlyDeparturesToday > 1 ? 's' : ''} hoy`
            });
        }
        return alerts;
    }

    private buildActivity(s: DashboardStatsResponse): RecentActivity[] {
        const acts: RecentActivity[] = [];
        const now = 'Hoy';

        if (s.presentToday > 0) {
            acts.push({
                icon: 'pi pi-check-circle',
                color: '#059669',
                title: 'Asistencia registrada',
                detail: `${s.presentToday} alumnos presentes hoy`,
                time: now
            });
        }
        if (s.lateToday > 0) {
            acts.push({
                icon: 'pi pi-clock',
                color: '#d97706',
                title: 'Tardanzas',
                detail: `${s.lateToday} alumno${s.lateToday > 1 ? 's' : ''} con tardanza hoy`,
                time: now
            });
        }
        if (s.qrEntradasToday > 0) {
            acts.push({
                icon: 'pi pi-qrcode',
                color: '#6366f1',
                title: 'Accesos QR',
                detail: `${s.qrEntradasToday} entradas registradas vía QR`,
                time: now
            });
        }
        if (s.collectedThisMonth > 0) {
            acts.push({
                icon: 'pi pi-credit-card',
                color: '#0ea5e9',
                title: 'Cobros del mes',
                detail: `Gs. ${s.collectedThisMonth.toLocaleString('es-PY')} recaudados`,
                time: 'Este mes'
            });
        }
        return acts;
    }

    // ── Navegación ────────────────────────────────────────────────────────────

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getAlertSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        return (['danger', 'warn', 'info'] as const).includes(type as any) ? (type as 'danger' | 'warn' | 'info') : 'secondary';
    }

    getEventStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        return (
            (
                {
                    PLANNED: 'info',
                    ACTIVE: 'success',
                    COMPLETED: 'secondary',
                    CANCELLED: 'danger'
                } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'>
            )[s] ?? 'secondary'
        );
    }

    getEventStatusLabel(s: string): string {
        return ({ PLANNED: 'Planificado', ACTIVE: 'Activo', COMPLETED: 'Completado', CANCELLED: 'Cancelado' } as Record<string, string>)[s] ?? s;
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
