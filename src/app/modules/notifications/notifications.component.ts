// src/app/modules/notifications/notifications.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationsService, NotificationFilter, CreateNotificationRequest } from '../../core/services/conf/notifications.service';
import { NotificationMock, NotificationTypeMock } from '../../shared/data/notifications.mock';
import { TypeCountPipe } from '../../shared/pipes/type-count.pipe';

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TextareaModule,
        ToggleSwitchModule,
        DialogModule,
        SkeletonModule,
        TagModule,
        TooltipModule,
        ToastModule,
        ConfirmDialogModule,
        BadgeModule,
        TypeCountPipe
    ],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class NotificationsComponent implements OnInit, OnDestroy {
    // ── Datos ─────────────────────────────────────────────────────────────────
    types = signal<NotificationTypeMock[]>([]);
    notifications = signal<NotificationMock[]>([]);
    stats = signal<any>(null);

    // ── Estado UI ─────────────────────────────────────────────────────────────
    loadingNotifs = signal(false);
    selectedTypeId = signal<number | null>(null); // null = todas
    searchText = '';
    filterPriority: string | null = null;
    filterRead: boolean | null = null;

    // ── Detalle ───────────────────────────────────────────────────────────────
    showDetail = signal(false);
    selectedNotif = signal<NotificationMock | null>(null);

    // ── Crear / enviar ────────────────────────────────────────────────────────
    showCreateForm = signal(false);
    savingNotif = signal(false);
    createForm!: FormGroup;

    readonly priorityOptions = [
        { label: 'Todos', value: null },
        { label: 'Crítico', value: 'CRITICAL' },
        { label: 'Alto', value: 'HIGH' },
        { label: 'Medio', value: 'MEDIUM' },
        { label: 'Bajo', value: 'LOW' }
    ];
    readonly priorityFormOptions = [
        { label: 'Crítico', value: 'CRITICAL' },
        { label: 'Alto', value: 'HIGH' },
        { label: 'Medio', value: 'MEDIUM' },
        { label: 'Bajo', value: 'LOW' }
    ];
    readonly scopeOptions = [
        { label: 'Todos (general)', value: 'ALL' },
        { label: 'Alumno específico', value: 'STUDENT' },
        { label: 'Personal', value: 'STAFF' },
        { label: 'Grado', value: 'GRADE' },
        { label: 'Sección', value: 'SECTION' }
    ];
    readonly readOptions = [
        { label: 'Todas', value: null },
        { label: 'No leídas', value: false },
        { label: 'Leídas', value: true }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private notifService: NotificationsService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.loadTypes();
        this.loadStats();
        this.loadNotifications();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadTypes(): void {
        this.notifService
            .getTypes()
            .pipe(takeUntil(this.destroy$))
            .subscribe((t) => this.types.set(t));
    }

    loadStats(): void {
        this.notifService
            .getStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    loadNotifications(): void {
        this.loadingNotifs.set(true);
        const f: NotificationFilter = {
            search: this.searchText || undefined,
            idNotificationType: this.selectedTypeId(),
            priority: this.filterPriority ?? undefined,
            isRead: this.filterRead ?? undefined
        };
        this.notifService
            .getNotifications(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((n) => {
                this.notifications.set(n);
                this.loadingNotifs.set(false);
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    selectType(idType: number | null): void {
        this.selectedTypeId.set(idType);
        this.loadNotifications();
    }

    onSearch(): void {
        this.loadNotifications();
    }
    onFilter(): void {
        this.loadNotifications();
    }
    clearFilters(): void {
        this.searchText = '';
        this.filterPriority = null;
        this.filterRead = null;
        this.loadNotifications();
    }
    get hasFilters(): boolean {
        return !!(this.searchText || this.filterPriority || this.filterRead !== null);
    }

    // ── Lectura ───────────────────────────────────────────────────────────────

    openDetail(notif: NotificationMock): void {
        this.selectedNotif.set(notif);
        this.showDetail.set(true);
        if (!notif.isRead) {
            this.notifService
                .markAsRead(notif.idNotification)
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.loadNotifications();
                    this.loadStats();
                });
        }
    }

    toggleRead(notif: NotificationMock, event: Event): void {
        event.stopPropagation();
        const action$ = notif.isRead ? this.notifService.markAsUnread(notif.idNotification) : this.notifService.markAsRead(notif.idNotification);
        action$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.loadNotifications();
            this.loadStats();
        });
    }

    markAllRead(): void {
        this.notifService
            .markAllAsRead(this.selectedTypeId() ?? undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadNotifications();
                this.loadStats();
                this.messageService.add({ severity: 'success', summary: 'Todas marcadas como leídas' });
            });
    }

    // ── Eliminar ──────────────────────────────────────────────────────────────

    confirmDelete(notif: NotificationMock, event: Event): void {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: `¿Eliminar la notificación "${notif.title}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.notifService
                    .deleteNotification(notif.idNotification)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.loadNotifications();
                        this.loadStats();
                        if (this.selectedNotif()?.idNotification === notif.idNotification) {
                            this.showDetail.set(false);
                        }
                        this.messageService.add({ severity: 'success', summary: 'Notificación eliminada' });
                    });
            }
        });
    }

    // ── Crear y enviar ────────────────────────────────────────────────────────

    openCreate(): void {
        this.createForm.reset({ priority: 'MEDIUM', scope: 'ALL', sendNow: true });
        this.showCreateForm.set(true);
    }

    submitCreate(): void {
        if (this.createForm.invalid) {
            this.createForm.markAllAsTouched();
            return;
        }
        this.savingNotif.set(true);
        const v = this.createForm.value;
        const req: CreateNotificationRequest = {
            idNotificationType: v.idNotificationType,
            title: v.title,
            body: v.body,
            priority: v.priority,
            scope: v.scope,
            idTarget: v.idTarget || undefined,
            sendNow: v.sendNow ?? true
        };
        this.notifService
            .createAndSend(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.savingNotif.set(false);
                    this.showCreateForm.set(false);
                    this.loadNotifications();
                    this.loadStats();
                    this.messageService.add({
                        severity: 'success',
                        summary: req.sendNow ? 'Notificación enviada' : 'Notificación guardada',
                        detail: req.title
                    });
                },
                error: () => this.savingNotif.set(false)
            });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getPriorityLabel(p: string): string {
        const m: Record<string, string> = { CRITICAL: 'Crítico', HIGH: 'Alto', MEDIUM: 'Medio', LOW: 'Bajo' };
        return m[p] ?? p;
    }

    getPrioritySeverity(p: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            CRITICAL: 'danger',
            HIGH: 'warn',
            MEDIUM: 'info',
            LOW: 'secondary'
        };
        return m[p] ?? 'secondary';
    }

    getScopeLabel(s: string): string {
        const m: Record<string, string> = {
            ALL: 'General',
            STUDENT: 'Alumno',
            STAFF: 'Personal',
            GRADE: 'Grado',
            SECTION: 'Sección'
        };
        return m[s] ?? s;
    }

    getUnreadCount(idType: number): number {
        return this.stats()?.byType?.find((t: any) => t.idNotificationType === idType)?.unread ?? 0;
    }

    get selectedTypeUnread(): number {
        const id = this.selectedTypeId();
        if (id == null) return this.stats()?.unread ?? 0;
        return this.getUnreadCount(id);
    }

    get typeFormOptions(): { label: string; value: number }[] {
        return this.types().map((t) => ({ label: t.name, value: t.idNotificationType }));
    }

    get showTargetSelector(): boolean {
        const scope = this.createForm?.get('scope')?.value;
        return scope === 'STUDENT' || scope === 'STAFF';
    }

    get targetOptions(): { label: string; value: number }[] {
        const scope = this.createForm?.get('scope')?.value;
        return scope === 'STUDENT' ? this.notifService.getStudentOptions() : this.notifService.getStaffOptions();
    }

    isFieldInvalid(field: string): boolean {
        const c = this.createForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    private buildForm(): void {
        this.createForm = this.fb.group({
            idNotificationType: [null, Validators.required],
            title: ['', Validators.required],
            body: ['', Validators.required],
            priority: ['MEDIUM', Validators.required],
            scope: ['ALL', Validators.required],
            idTarget: [null],
            sendNow: [true]
        });
    }
}
