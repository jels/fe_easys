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

// Services
import { NotificationsService, NotificationFilter } from '../../core/services/api/notifications.service';
import { StudentsService } from '../../core/services/api/students.service';
import { StaffService } from '../../core/services/api/staff.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { NotificationTypeResponse, AppNotificationResponse, NotificationStatsResponse, CreateAppNotificationRequest } from '../../core/models/notifications.models';
import { StaffResponse } from '../../core/models/staff.models';

// Pipes
import { TypeCountPipe } from '../../shared/pipes/type-count.pipe';
import { StudentResponse } from '../../core/models/student.dto';

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
    types = signal<NotificationTypeResponse[]>([]);
    notifications = signal<AppNotificationResponse[]>([]);
    stats = signal<NotificationStatsResponse | null>(null);

    // ── Estado UI ─────────────────────────────────────────────────────────────
    loadingNotifs = signal(false);
    selectedTypeId = signal<number | null>(null);
    searchText = '';
    filterPriority: string | null = null;
    filterRead: boolean | null = null;

    // ── Detalle ───────────────────────────────────────────────────────────────
    showDetail = signal(false);
    selectedNotif = signal<AppNotificationResponse | null>(null);

    // ── Crear / enviar ────────────────────────────────────────────────────────
    showCreateForm = signal(false);
    savingNotif = signal(false);
    createForm!: FormGroup;

    // Para el selector de target — cargados del backend
    private _students = signal<StudentResponse[]>([]);
    private _staff = signal<StaffResponse[]>([]);

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
        private studentsService: StudentsService,
        private staffService: StaffService,
        private authService: AuthService,
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
        this.loadTargetData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadTypes(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.notifService
            .getTypes(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.types.set(res.data ?? []);
                }
            });
    }

    loadStats(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.notifService
            .getStats(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                }
            });
    }

    loadNotifications(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingNotifs.set(true);

        const f: NotificationFilter = {
            idNotificationType: this.selectedTypeId() ?? undefined,
            priority: this.filterPriority ?? undefined,
            isRead: this.filterRead ?? undefined
        };

        this.notifService
            .getNotifications(idCompany, f)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    let data = res.success ? (res.data?.content ?? []) : [];
                    // Filtro de búsqueda texto client-side
                    if (this.searchText) {
                        const q = this.searchText.toLowerCase();
                        data = data.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || (n.typeName ?? '').toLowerCase().includes(q));
                    }
                    this.notifications.set(data);
                    this.loadingNotifs.set(false);
                },
                error: () => this.loadingNotifs.set(false)
            });
    }

    // Carga alumnos y personal para el selector de target del formulario
    private loadTargetData(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.studentsService
            .getAll(idCompany, { size: 500 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this._students.set(res.data?.content ?? []);
                }
            });

        this.staffService
            .getAll(idCompany, { size: 200 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this._staff.set(res.data?.content ?? []);
                }
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

    openDetail(notif: AppNotificationResponse): void {
        this.selectedNotif.set(notif);
        this.showDetail.set(true);
        if (!notif.isRead) {
            this.notifService
                .markAsRead(notif.idAppNotification)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loadNotifications();
                        this.loadStats();
                    }
                });
        }
    }

    toggleRead(notif: AppNotificationResponse, event: Event): void {
        event.stopPropagation();
        const action$ = notif.isRead ? this.notifService.markAsUnread(notif.idAppNotification) : this.notifService.markAsRead(notif.idAppNotification);
        action$.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.loadNotifications();
                this.loadStats();
            }
        });
    }

    markAllRead(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.notifService
            .markAllAsRead(idCompany, this.selectedTypeId() ?? undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadNotifications();
                    this.loadStats();
                    this.messageService.add({ severity: 'success', summary: 'Todas marcadas como leídas' });
                }
            });
    }

    // ── Eliminar ──────────────────────────────────────────────────────────────

    confirmDelete(notif: AppNotificationResponse, event: Event): void {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: `¿Eliminar la notificación "${notif.title}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.notifService
                    .deleteNotification(notif.idAppNotification)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadNotifications();
                            this.loadStats();
                            if (this.selectedNotif()?.idAppNotification === notif.idAppNotification) {
                                this.showDetail.set(false);
                            }
                            this.messageService.add({ severity: 'success', summary: 'Notificación eliminada' });
                        }
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
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.savingNotif.set(true);

        const v = this.createForm.value;
        const req: CreateAppNotificationRequest = {
            idCompany,
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
                next: (res) => {
                    this.savingNotif.set(false);
                    if (res.success) {
                        this.showCreateForm.set(false);
                        this.loadNotifications();
                        this.loadStats();
                        this.messageService.add({
                            severity: 'success',
                            summary: req.sendNow ? 'Notificación enviada' : 'Notificación guardada',
                            detail: req.title
                        });
                    }
                },
                error: () => this.savingNotif.set(false)
            });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getPriorityLabel(p: string): string {
        return ({ CRITICAL: 'Crítico', HIGH: 'Alto', MEDIUM: 'Medio', LOW: 'Bajo' } as Record<string, string>)[p] ?? p;
    }

    getPrioritySeverity(p: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return ({ CRITICAL: 'danger', HIGH: 'warn', MEDIUM: 'info', LOW: 'secondary' } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>)[p] ?? 'secondary';
    }

    getScopeLabel(s: string): string {
        return ({ ALL: 'General', STUDENT: 'Alumno', STAFF: 'Personal', GRADE: 'Grado', SECTION: 'Sección' } as Record<string, string>)[s] ?? s;
    }

    getUnreadCount(idType: number): number {
        return this.stats()?.byType?.find((t) => t.idNotificationType === idType)?.unread ?? 0;
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

    // Reemplaza notifService.getStudentOptions() / getStaffOptions()
    get targetOptions(): { label: string; value: number }[] {
        const scope = this.createForm?.get('scope')?.value;
        if (scope === 'STUDENT') {
            return this._students().map((s) => ({
                label: `${s.person.fullName} — ${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trimEnd(),
                value: s.idStudent
            }));
        }
        return this._staff().map((s) => ({
            label: `${s.person.fullName} (${s.position ?? s.staffType})`,
            value: s.idStaff
        }));
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
