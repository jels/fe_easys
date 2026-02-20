// src/app/core/services/conf/dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { MOCK_STUDENTS } from '../../../shared/data/people.mock';
import { MOCK_STAFF } from '../../../shared/data/staff.mock';
import { MOCK_EVENTS, EventMock, MOCK_EVENT_REGISTRATIONS } from '../../../shared/data/operations.mock';
import { MOCK_STUDENT_INFRACTIONS } from '../../../shared/data/operations.mock';
import { MOCK_EARLY_DEPARTURES } from '../../../shared/data/operations.mock';
import { MOCK_STUDENT_ACCESS_LOGS } from '../../../shared/data/operations.mock';
import { MOCK_SECTIONS, MOCK_SCHOOL_PERIODS } from '../../../shared/data/academic.mock';

// Tipos de retorno del dashboard
export interface DashboardStats {
    students: { total: number; active: number; newThisMonth: number };
    staff: { total: number; active: number };
    sections: { total: number };
    payments: { pendingCount: number; overdueCount: number };
    access: { presentToday: number; absentToday: number; lateToday: number };
    infractions: { openCount: number; criticalCount: number };
    activePeriod: string;
    activeYear: string;
}

export interface DashboardAlert {
    id: number;
    type: 'danger' | 'warn' | 'info';
    category: string;
    title: string;
    detail: string;
    icon: string;
    link?: string;
}

export interface RecentActivity {
    id: number;
    type: string; // ACCESS | INFRACTION | PAYMENT | DEPARTURE | EVENT
    icon: string;
    color: string;
    title: string;
    detail: string;
    time: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly DELAY_MS = 400;

    getStats(): Observable<DashboardStats> {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = today.slice(0, 7);

        const activePeriod = MOCK_SCHOOL_PERIODS.find((p) => p.isActive);

        const todayLogs = MOCK_STUDENT_ACCESS_LOGS.filter((l) => l.accessDate === today || l.accessDate === '2025-02-19');

        return of({
            students: {
                total: MOCK_STUDENTS.length,
                active: MOCK_STUDENTS.filter((s) => s.isActive).length,
                newThisMonth: MOCK_STUDENTS.filter((s) => s.isActive).length > 0 ? 3 : 0
            },
            staff: {
                total: MOCK_STAFF.length,
                active: MOCK_STAFF.filter((s) => s.isActive).length
            },
            sections: {
                total: MOCK_SECTIONS.filter((s) => s.isActive).length
            },
            payments: {
                pendingCount: 4,
                overdueCount: 2
            },
            access: {
                presentToday: todayLogs.filter((l) => !l.isAbsent).length,
                absentToday: todayLogs.filter((l) => l.isAbsent).length,
                lateToday: todayLogs.filter((l) => l.isLate).length
            },
            infractions: {
                openCount: MOCK_STUDENT_INFRACTIONS.filter((i) => i.isActive).length,
                criticalCount: MOCK_STUDENT_INFRACTIONS.filter((i) => i.isActive && i.severity === 'CRITICAL').length
            },
            activePeriod: activePeriod?.name ?? 'Sin período activo',
            activeYear: activePeriod?.schoolYearName ?? 'Sin año activo'
        } as DashboardStats).pipe(delay(this.DELAY_MS));
    }

    getAlerts(): Observable<DashboardAlert[]> {
        const alerts: DashboardAlert[] = [];

        // Infracciones críticas sin resolver
        const critical = MOCK_STUDENT_INFRACTIONS.filter((i) => i.isActive && i.severity === 'CRITICAL');
        critical.forEach((i) =>
            alerts.push({
                id: i.idStudentInfraction,
                type: 'danger',
                category: 'Infracción crítica',
                title: i.studentName ?? 'Alumno',
                detail: i.description,
                icon: 'pi-exclamation-triangle',
                link: '/sys/access'
            })
        );

        // Infracciones HIGH sin notificar a padres
        const unnotified = MOCK_STUDENT_INFRACTIONS.filter((i) => i.isActive && i.severity === 'HIGH' && !i.parentNotified);
        unnotified.forEach((i) =>
            alerts.push({
                id: i.idStudentInfraction + 100,
                type: 'warn',
                category: 'Sin notificar',
                title: `${i.studentName ?? 'Alumno'} — padres sin notificar`,
                detail: i.infractionTypeName ?? 'Infracción',
                icon: 'pi-bell',
                link: '/sys/access'
            })
        );

        // Pagos vencidos (simulado)
        alerts.push({
            id: 901,
            type: 'warn',
            category: 'Pagos vencidos',
            title: '2 cuotas vencidas sin pagar',
            detail: 'Alumnos con saldo pendiente del período anterior',
            icon: 'pi-credit-card',
            link: '/sys/payments'
        });

        // Evento próximo en los próximos 7 días
        const today = new Date();
        const in7 = new Date(today);
        in7.setDate(today.getDate() + 7);
        const todayStr = today.toISOString().split('T')[0];
        const in7Str = in7.toISOString().split('T')[0];
        const upcoming = MOCK_EVENTS.filter((e) => e.isActive && e.status === 'PLANNED' && e.eventDate >= todayStr && e.eventDate <= in7Str);
        upcoming.forEach((e) =>
            alerts.push({
                id: e.idEvent + 200,
                type: 'info',
                category: 'Evento próximo',
                title: e.name,
                detail: `${e.eventDate}${e.eventTime ? ' a las ' + e.eventTime : ''} — ${e.location ?? ''}`,
                icon: 'pi-calendar',
                link: '/sys/payments'
            })
        );

        // Ausencias sin justificar
        const unjustified = MOCK_STUDENT_ACCESS_LOGS.filter((l) => l.isAbsent && !l.absenceJustified && l.accessDate === '2025-02-19');
        if (unjustified.length > 0) {
            alerts.push({
                id: 801,
                type: 'warn',
                category: 'Ausencias',
                title: `${unjustified.length} ausencia(s) sin justificar hoy`,
                detail: unjustified.map((l) => l.studentName).join(', '),
                icon: 'pi-user-minus',
                link: '/sys/access'
            });
        }

        return of(alerts.slice(0, 8)).pipe(delay(this.DELAY_MS));
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        const activity: RecentActivity[] = [];

        // Últimas infracciones
        [...MOCK_STUDENT_INFRACTIONS]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 3)
            .forEach((i) =>
                activity.push({
                    id: i.idStudentInfraction,
                    type: 'INFRACTION',
                    icon: 'pi-exclamation-circle',
                    color: i.severity === 'CRITICAL' ? '#dc2626' : i.severity === 'HIGH' ? '#f59e0b' : '#6366f1',
                    title: `Infracción — ${i.studentName ?? ''}`,
                    detail: i.infractionTypeName ?? i.description,
                    time: i.incidentDate
                })
            );

        // Últimas salidas anticipadas
        [...MOCK_EARLY_DEPARTURES]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 2)
            .forEach((d) =>
                activity.push({
                    id: d.idEarlyDeparture + 100,
                    type: 'DEPARTURE',
                    icon: 'pi-sign-out',
                    color: '#10b981',
                    title: `Salida anticipada — ${d.studentName ?? ''}`,
                    detail: d.reason,
                    time: d.departureDatetime.split('T')[0]
                })
            );

        // Últimos logs de acceso tarde
        MOCK_STUDENT_ACCESS_LOGS.filter((l) => l.isLate)
            .slice(0, 2)
            .forEach((l) =>
                activity.push({
                    id: l.idStudentAccessLog + 200,
                    type: 'ACCESS',
                    icon: 'pi-clock',
                    color: '#f59e0b',
                    title: `Llegada tardía — ${l.studentName ?? ''}`,
                    detail: `${l.gradeName ?? ''} ${l.sectionName ?? ''}`,
                    time: l.accessDate
                })
            );

        // Registraciones de eventos recientes
        [...MOCK_EVENT_REGISTRATIONS]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 2)
            .forEach((r) =>
                activity.push({
                    id: r.idEventRegistration + 300,
                    type: 'EVENT',
                    icon: 'pi-calendar-plus',
                    color: '#8b5cf6',
                    title: `Inscripción — ${r.studentName ?? ''}`,
                    detail: r.eventName ?? '',
                    time: r.registrationDate
                })
            );

        // Ordenar por fecha desc y tomar los 8 más recientes
        const sorted = activity.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
        return of(sorted).pipe(delay(this.DELAY_MS));
    }

    getUpcomingEvents(): Observable<EventMock[]> {
        const today = new Date().toISOString().split('T')[0];
        // En demo usamos fecha fija para que siempre haya datos
        const demoRef = '2025-02-19';
        const result = MOCK_EVENTS.filter((e) => e.isActive && e.status !== 'CANCELLED' && e.eventDate >= demoRef)
            .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
            .slice(0, 5);
        return of(result).pipe(delay(this.DELAY_MS));
    }
}
