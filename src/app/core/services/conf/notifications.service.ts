// src/app/core/services/conf/notifications.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_NOTIFICATIONS, MOCK_NOTIFICATION_TYPES, NotificationMock, NotificationTypeMock } from '../../../shared/data/notifications.mock';
import { MOCK_STUDENTS } from '../../../shared/data/people.mock';
import { MOCK_STAFF } from '../../../shared/data/staff.mock';

export interface NotificationFilter {
    search?: string;
    idNotificationType?: number | null;
    isRead?: boolean | null;
    priority?: string | null;
    scope?: string | null;
}

export interface CreateNotificationRequest {
    idNotificationType: number;
    title: string;
    body: string;
    priority: string;
    scope: string;
    idTarget?: number;
    sendNow: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    private readonly DELAY_MS = 350;
    private nextId = 100;

    private _notifications = signal<NotificationMock[]>([...MOCK_NOTIFICATIONS]);

    // ── Tipos ─────────────────────────────────────────────────────────────────

    getTypes(): Observable<NotificationTypeMock[]> {
        return of(MOCK_NOTIFICATION_TYPES.filter((t) => t.isActive)).pipe(delay(this.DELAY_MS));
    }

    // ── Notificaciones ────────────────────────────────────────────────────────

    getNotifications(filters?: NotificationFilter): Observable<NotificationMock[]> {
        let result = this._notifications().filter((n) => n.isActive);

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || (n.typeName ?? '').toLowerCase().includes(q));
        }
        if (filters?.idNotificationType != null) result = result.filter((n) => n.idNotificationType === filters.idNotificationType);
        if (filters?.isRead != null) result = result.filter((n) => n.isRead === filters.isRead);
        if (filters?.priority) result = result.filter((n) => n.priority === filters.priority);
        if (filters?.scope) result = result.filter((n) => n.scope === filters.scope);

        return of([...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt))).pipe(delay(this.DELAY_MS));
    }

    markAsRead(idNotification: number): Observable<void> {
        this._notifications.update((list) => list.map((n) => (n.idNotification === idNotification ? { ...n, isRead: true } : n)));
        return of(void 0).pipe(delay(200));
    }

    markAsUnread(idNotification: number): Observable<void> {
        this._notifications.update((list) => list.map((n) => (n.idNotification === idNotification ? { ...n, isRead: false } : n)));
        return of(void 0).pipe(delay(200));
    }

    markAllAsRead(idNotificationType?: number): Observable<void> {
        this._notifications.update((list) =>
            list.map((n) => {
                if (!n.isActive) return n;
                if (idNotificationType != null && n.idNotificationType !== idNotificationType) return n;
                return { ...n, isRead: true };
            })
        );
        return of(void 0).pipe(delay(300));
    }

    deleteNotification(idNotification: number): Observable<void> {
        this._notifications.update((list) => list.map((n) => (n.idNotification === idNotification ? { ...n, isActive: false } : n)));
        return of(void 0).pipe(delay(300));
    }

    createAndSend(req: CreateNotificationRequest): Observable<NotificationMock> {
        const type = MOCK_NOTIFICATION_TYPES.find((t) => t.idNotificationType === req.idNotificationType);

        let targetName: string | undefined;
        if (req.scope === 'STUDENT' && req.idTarget) {
            targetName = MOCK_STUDENTS.find((s) => s.idStudent === req.idTarget)?.fullName;
        } else if (req.scope === 'STAFF' && req.idTarget) {
            targetName = MOCK_STAFF.find((s) => s.idStaff === req.idTarget)?.fullName;
        }

        const now = new Date().toISOString();
        const newNotif: NotificationMock = {
            idNotification: this.nextId++,
            idCompany: 1,
            idNotificationType: req.idNotificationType,
            typeName: type?.name,
            typeColor: type?.color,
            typeIcon: type?.icon,
            title: req.title,
            body: req.body,
            priority: req.priority,
            scope: req.scope,
            idTarget: req.idTarget,
            targetName,
            isRead: false,
            isSent: req.sendNow,
            sentAt: req.sendNow ? now : undefined,
            idCreatedByStaff: 1,
            createdByName: 'Roberto Sánchez Duarte',
            isActive: true,
            createdAt: now
        };
        this._notifications.update((list) => [newNotif, ...list]);
        return of(newNotif).pipe(delay(600));
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    getStats(): Observable<{
        total: number;
        unread: number;
        critical: number;
        unsent: number;
        byType: { idNotificationType: number; name: string; count: number; unread: number }[];
    }> {
        const active = this._notifications().filter((n) => n.isActive);
        const byType = MOCK_NOTIFICATION_TYPES.filter((t) => t.isActive).map((t) => ({
            idNotificationType: t.idNotificationType,
            name: t.name,
            count: active.filter((n) => n.idNotificationType === t.idNotificationType).length,
            unread: active.filter((n) => n.idNotificationType === t.idNotificationType && !n.isRead).length
        }));

        return of({
            total: active.length,
            unread: active.filter((n) => !n.isRead).length,
            critical: active.filter((n) => n.priority === 'CRITICAL' && !n.isRead).length,
            unsent: active.filter((n) => !n.isSent).length,
            byType
        }).pipe(delay(this.DELAY_MS));
    }

    // ── Opciones para formulario ──────────────────────────────────────────────

    getStudentOptions(): { label: string; value: number }[] {
        return MOCK_STUDENTS.filter((s) => s.isActive).map((s) => ({
            label: `${s.fullName} — ${s.gradeName ?? ''} ${s.sectionName ?? ''}`,
            value: s.idStudent
        }));
    }

    getStaffOptions(): { label: string; value: number }[] {
        return MOCK_STAFF.filter((s) => s.isActive).map((s) => ({
            label: s.fullName,
            value: s.idStaff
        }));
    }
}
