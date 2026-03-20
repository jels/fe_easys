// src/app/modules/events/events.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { EventsService } from '../../core/services/api/events.service';
import { StudentsService } from '../../core/services/api/students.service';
import { SettingsService } from '../../core/services/api/settings.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { EventTypeResponse, EventResponse, EventRegistrationResponse, EventStatsResponse, CreateEventRequest, RegisterStudentEventRequest } from '../../core/models/events.models';
import { SchoolYearResponse } from '../../core/models/settings.models';

// Pipes
import { EventTypeCountPipe } from '../../shared/pipes/event-type-count.pipe';
import { StudentResponse } from '../../core/models/student.dto';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule,
        TableModule,
        TagModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        TextareaModule,
        ToggleSwitchModule,
        DialogModule,
        SkeletonModule,
        TooltipModule,
        ToastModule,
        ConfirmDialogModule,
        EventTypeCountPipe
    ],
    templateUrl: './events.component.html',
    styleUrl: './events.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class EventsComponent implements OnInit, OnDestroy {
    activeTab = signal('0');

    // ── Datos de referencia ───────────────────────────────────────────────────
    eventTypes = signal<EventTypeResponse[]>([]);
    stats = signal<EventStatsResponse | null>(null);
    schoolYears = signal<SchoolYearResponse[]>([]);

    // ── Tab 0: Lista ──────────────────────────────────────────────────────────
    events = signal<EventResponse[]>([]);
    loadingEvents = signal(false);
    searchEvent = '';
    filterStatus: string | null = null;
    filterType: number | null = null;
    filterScope: string | null = null;

    // ── Tab 1: Calendario ─────────────────────────────────────────────────────
    calendarYear = signal(new Date().getFullYear());
    calendarMonth = signal(new Date().getMonth() + 1);
    calendarEvents = signal<EventResponse[]>([]);
    loadingCalendar = signal(false);

    // ── Tab 2: Inscripciones ──────────────────────────────────────────────────
    selectedEventForReg = signal<EventResponse | null>(null);
    registrations = signal<EventRegistrationResponse[]>([]);
    availableStudents = signal<StudentResponse[]>([]);
    loadingReg = signal(false);
    showRegDialog = signal(false);
    selectedStudentToReg: StudentResponse | null = null;
    regNotes = '';

    // ── Modal: Nuevo Evento ───────────────────────────────────────────────────
    showEventForm = signal(false);
    loadingForm = signal(false);
    eventForm!: FormGroup;

    // ── Modal: Detalle del Evento ─────────────────────────────────────────────
    // p-dialog usa [(visible)] con two-way binding — se mantiene como propiedad
    showDetail = false;
    selectedEvent = signal<EventResponse | null>(null);
    loadingDetail = signal(false);

    readonly MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    readonly DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    readonly statusOptions = [
        { label: 'Todos', value: null },
        { label: 'Planificado', value: 'PLANNED' },
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Completado', value: 'COMPLETED' },
        { label: 'Cancelado', value: 'CANCELLED' }
    ];
    readonly scopeOptions = [
        { label: 'Todos', value: null },
        { label: 'General', value: 'GENERAL' },
        { label: 'Grado', value: 'GRADE' },
        { label: 'Sección', value: 'SECTION' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private eventsService: EventsService,
        private studentsService: StudentsService,
        private settingsService: SettingsService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.loadReferenceData();
        this.loadEvents();
        this.loadCalendar();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga de referencia ───────────────────────────────────────────────────

    loadReferenceData(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.eventsService
            .getEventTypes(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.eventTypes.set(res.data ?? []);
                }
            });

        this.eventsService
            .getStats(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                }
            });

        this.settingsService
            .getSchoolYears(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.schoolYears.set(res.data ?? []);
                }
            });
    }

    // ── Tab 0: Lista ──────────────────────────────────────────────────────────

    loadEvents(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingEvents.set(true);

        this.eventsService
            .getEvents(idCompany, {
                search: this.searchEvent || undefined,
                status: this.filterStatus || undefined,
                idEventType: this.filterType || undefined
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    let data = res.success ? (res.data?.content ?? []) : [];
                    // filtro de scope client-side (el backend puede no soportarlo)
                    if (this.filterScope) data = data.filter((e) => e.scope === this.filterScope);
                    this.events.set(data);
                    this.loadingEvents.set(false);
                },
                error: () => this.loadingEvents.set(false)
            });
    }

    onSearch(): void {
        this.loadEvents();
    }
    onFilter(): void {
        this.loadEvents();
    }
    clearFilters(): void {
        this.searchEvent = '';
        this.filterStatus = null;
        this.filterType = null;
        this.filterScope = null;
        this.loadEvents();
    }
    get hasFilters(): boolean {
        return !!(this.searchEvent || this.filterStatus || this.filterType || this.filterScope);
    }

    // ── Detalle ───────────────────────────────────────────────────────────────

    openDetail(event: EventResponse): void {
        this.loadingDetail.set(true);
        this.showDetail = true;
        this.eventsService
            .getEventById(event.idEvent)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.selectedEvent.set(res.success ? (res.data ?? null) : null);
                    this.loadingDetail.set(false);
                },
                error: () => this.loadingDetail.set(false)
            });
    }

    closeDetail(): void {
        this.showDetail = false;
        this.selectedEvent.set(null);
    }

    // ── Cambio de estado ──────────────────────────────────────────────────────

    changeStatus(event: EventResponse, newStatus: string): void {
        if (event.status === newStatus) return;
        const label = newStatus === 'ACTIVE' ? 'iniciar' : 'completar';
        this.confirmationService.confirm({
            message: `¿Confirma que desea ${label} el evento "${event.name}"?`,
            header: 'Confirmar cambio de estado',
            icon: 'pi pi-question-circle',
            accept: () => {
                this.eventsService
                    .updateStatus(event.idEvent, newStatus)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadEvents();
                            if (this.selectedEvent()?.idEvent === event.idEvent) {
                                this.openDetail(event);
                            }
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Estado actualizado',
                                detail: `Evento marcado como ${this.getStatusLabel(newStatus)}`
                            });
                        }
                    });
            }
        });
    }

    cancelEvent(event: EventResponse): void {
        this.confirmationService.confirm({
            message: `¿Cancelar el evento "${event.name}"? Esta acción no se puede deshacer.`,
            header: 'Cancelar evento',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eventsService
                    .updateStatus(event.idEvent, 'CANCELLED')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadEvents();
                            this.messageService.add({ severity: 'warn', summary: 'Evento cancelado' });
                        }
                    });
            }
        });
    }

    // ── Nuevo Evento ──────────────────────────────────────────────────────────

    private buildForm(): void {
        this.eventForm = this.fb.group({
            idEventType: [null, Validators.required],
            idSchoolYear: [null, Validators.required],
            name: ['', Validators.required],
            description: [''],
            eventDate: [null, Validators.required],
            eventTime: [''],
            endDate: [null],
            endTime: [''],
            location: [''],
            scope: ['GENERAL', Validators.required],
            maxParticipants: [null],
            requiresPayment: [false],
            registrationDeadline: [null],
            idResponsibleStaff: [null],
            observations: ['']
        });
    }

    openNewEvent(): void {
        // Pre-seleccionar el año activo
        const activeYear = this.schoolYears().find((y) => y.isActive);
        this.eventForm.reset({ scope: 'GENERAL', requiresPayment: false });
        if (activeYear) this.eventForm.patchValue({ idSchoolYear: activeYear.idSchoolYear });
        this.showEventForm.set(true);
    }

    submitEvent(): void {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            return;
        }
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingForm.set(true);

        const v = this.eventForm.value;
        const req: CreateEventRequest = {
            idCompany,
            idEventType: v.idEventType,
            idSchoolYear: v.idSchoolYear,
            name: v.name,
            description: v.description || undefined,
            eventDate: this.dateToStr(v.eventDate),
            eventTime: v.eventTime || undefined,
            endDate: v.endDate ? this.dateToStr(v.endDate) : undefined,
            endTime: v.endTime || undefined,
            location: v.location || undefined,
            scope: v.scope,
            maxParticipants: v.maxParticipants || undefined,
            requiresPayment: v.requiresPayment ?? false,
            registrationDeadline: v.registrationDeadline ? this.dateToStr(v.registrationDeadline) : undefined,
            idResponsibleStaff: v.idResponsibleStaff || undefined,
            observations: v.observations || undefined
        };

        this.eventsService
            .createEvent(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.loadingForm.set(false);
                    if (res.success) {
                        this.showEventForm.set(false);
                        this.loadEvents();
                        this.loadCalendar();
                        this.loadReferenceData();
                        this.messageService.add({ severity: 'success', summary: 'Evento creado', detail: req.name });
                    }
                },
                error: () => this.loadingForm.set(false)
            });
    }

    // ── Inscripciones ─────────────────────────────────────────────────────────

    selectEventForReg(event: EventResponse): void {
        this.selectedEventForReg.set(event);
        this.loadRegistrations(event.idEvent);
    }

    loadRegistrations(idEvent: number): void {
        this.loadingReg.set(true);
        this.eventsService
            .getRegistrationsByEvent(idEvent)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.registrations.set(res.success ? (res.data ?? []) : []);
                    this.loadingReg.set(false);
                },
                error: () => this.loadingReg.set(false)
            });
    }

    openRegDialog(): void {
        if (!this.selectedEventForReg()) return;
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        // Cargar alumnos disponibles: todos activos, filtramos los ya inscriptos client-side
        this.studentsService
            .getAll(idCompany, { size: 500 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const all = res.success ? (res.data?.content ?? []) : [];
                    const registeredIds = new Set(this.registrations().map((r) => r.idStudent));
                    this.availableStudents.set(all.filter((s) => !registeredIds.has(s.idStudent)));
                    this.selectedStudentToReg = null;
                    this.regNotes = '';
                    this.showRegDialog.set(true);
                }
            });
    }

    submitRegistration(): void {
        if (!this.selectedStudentToReg || !this.selectedEventForReg()) return;

        const req: RegisterStudentEventRequest = {
            idEvent: this.selectedEventForReg()!.idEvent,
            idStudent: this.selectedStudentToReg.idStudent
        };

        this.eventsService
            .registerStudent(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.showRegDialog.set(false);
                        this.loadRegistrations(this.selectedEventForReg()!.idEvent);
                        this.loadEvents();
                        this.messageService.add({ severity: 'success', summary: 'Alumno inscripto' });
                    }
                }
            });
    }

    cancelReg(reg: EventRegistrationResponse): void {
        this.confirmationService.confirm({
            message: `¿Cancelar inscripción de ${reg.studentName}?`,
            header: 'Cancelar inscripción',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eventsService
                    .cancelRegistration(reg.idEventRegistration)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadRegistrations(reg.idEvent);
                            this.messageService.add({ severity: 'warn', summary: 'Inscripción cancelada' });
                        }
                    });
            }
        });
    }

    // ── Calendario ────────────────────────────────────────────────────────────

    loadCalendar(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingCalendar.set(true);

        const y = this.calendarYear();
        const m = String(this.calendarMonth()).padStart(2, '0');
        const lastDay = new Date(y, this.calendarMonth(), 0).getDate();

        this.eventsService
            .getEvents(idCompany, {
                dateFrom: `${y}-${m}-01`,
                dateTo: `${y}-${m}-${lastDay}`,
                size: 100
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.calendarEvents.set(res.success ? (res.data?.content ?? []) : []);
                    this.loadingCalendar.set(false);
                },
                error: () => this.loadingCalendar.set(false)
            });
    }

    prevMonth(): void {
        if (this.calendarMonth() === 1) {
            this.calendarMonth.set(12);
            this.calendarYear.update((y) => y - 1);
        } else {
            this.calendarMonth.update((m) => m - 1);
        }
        this.loadCalendar();
    }

    nextMonth(): void {
        if (this.calendarMonth() === 12) {
            this.calendarMonth.set(1);
            this.calendarYear.update((y) => y + 1);
        } else {
            this.calendarMonth.update((m) => m + 1);
        }
        this.loadCalendar();
    }

    getCalendarDays(): (number | null)[] {
        const year = this.calendarYear();
        const month = this.calendarMonth();
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        const days: (number | null)[] = Array(offset).fill(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }

    getEventsForDay(day: number): EventResponse[] {
        const dateStr = `${this.calendarYear()}-${String(this.calendarMonth()).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return this.calendarEvents().filter((e) => e.eventDate === dateStr);
    }

    isToday(day: number): boolean {
        const today = new Date();
        return today.getFullYear() === this.calendarYear() && today.getMonth() + 1 === this.calendarMonth() && today.getDate() === day;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getStatusLabel(s: string): string {
        return ({ PLANNED: 'Planificado', ACTIVE: 'Activo', COMPLETED: 'Completado', CANCELLED: 'Cancelado' } as Record<string, string>)[s] ?? s;
    }

    getStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return ({ PLANNED: 'info', ACTIVE: 'success', COMPLETED: 'secondary', CANCELLED: 'danger' } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>)[s] ?? 'secondary';
    }

    getScopeLabel(s: string): string {
        return ({ GENERAL: 'General', GRADE: 'Grado', SECTION: 'Sección' } as Record<string, string>)[s] ?? s;
    }

    getRegStatusLabel(s: string): string {
        return ({ REGISTERED: 'Inscripto', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado', ATTENDED: 'Asistió' } as Record<string, string>)[s] ?? s;
    }

    getRegStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return ({ REGISTERED: 'info', CONFIRMED: 'success', CANCELLED: 'danger', ATTENDED: 'contrast' } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>)[s] ?? 'secondary';
    }

    getTypeColor(idEventType: number): string {
        return this.eventTypes().find((t) => t.idEventType === idEventType)?.color ?? '#6366f1';
    }

    getTypeIcon(idEventType: number): string {
        return this.eventTypes().find((t) => t.idEventType === idEventType)?.icon ?? 'pi-calendar';
    }

    get typeOptions(): { label: string; value: number | null }[] {
        return [{ label: 'Todos los tipos', value: null }, ...this.eventTypes().map((t) => ({ label: t.name, value: t.idEventType }))];
    }

    // StudentResponse: fullName en person.fullName
    get studentOptions(): { label: string; value: StudentResponse }[] {
        return this.availableStudents().map((s) => ({
            label: `${s.person.fullName} — ${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trimEnd(),
            value: s
        }));
    }

    get typeFormOptions(): { label: string; value: number }[] {
        return this.eventTypes().map((t) => ({ label: t.name, value: t.idEventType }));
    }

    get schoolYearOptions(): { label: string; value: number }[] {
        return this.schoolYears().map((y) => ({ label: y.name, value: y.idSchoolYear }));
    }

    isFieldInvalid(path: string): boolean {
        const c = this.eventForm.get(path);
        return !!(c?.invalid && c.touched);
    }

    private dateToStr(d: Date | string | null): string {
        if (!d) return '';
        if (typeof d === 'string') return d;
        return d.toISOString().split('T')[0];
    }
}
