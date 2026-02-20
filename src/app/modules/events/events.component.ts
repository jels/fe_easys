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

import { EventsService, EventFilter, CreateEventRequest } from '../../core/services/conf/events.service';
import { EventMock, EventRegistrationMock, EventTypeMock } from '../../shared/data/operations.mock';
import { StudentMock } from '../../shared/data/people.mock';
import { MOCK_SCHOOL_YEARS } from '../../shared/data/academic.mock';
import { EventTypeCountPipe } from '../../shared/pipes/event-type-count.pipe';

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
    eventTypes = signal<EventTypeMock[]>([]);
    stats = signal<any>(null);

    // ── Tab 0: Lista ──────────────────────────────────────────────────────────
    events = signal<EventMock[]>([]);
    loadingEvents = signal(false);
    searchEvent = '';
    filterStatus: string | null = null;
    filterType: number | null = null;
    filterScope: string | null = null;

    // ── Tab 1: Calendario ─────────────────────────────────────────────────────
    calendarYear = signal(new Date().getFullYear());
    calendarMonth = signal(new Date().getMonth() + 1); // 1-12
    calendarEvents = signal<EventMock[]>([]);
    loadingCalendar = signal(false);

    // ── Tab 2: Inscripciones ──────────────────────────────────────────────────
    selectedEventForReg = signal<EventMock | null>(null);
    registrations = signal<EventRegistrationMock[]>([]);
    availableStudents = signal<StudentMock[]>([]);
    loadingReg = signal(false);
    showRegDialog = signal(false);
    selectedStudentToReg: StudentMock | null = null;
    regNotes = '';

    // ── Tab 3: Tipos ──────────────────────────────────────────────────────────
    // Solo lectura en demo

    // ── Modal: Nuevo Evento ───────────────────────────────────────────────────
    showEventForm = signal(false);
    loadingForm = signal(false);
    eventForm!: FormGroup;

    // ── Modal: Detalle del Evento ─────────────────────────────────────────────
    showDetail = signal(false);
    selectedEvent = signal<EventMock | null>(null);
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
    readonly nextStatusMap: Record<string, { label: string; value: string; severity: string }> = {
        PLANNED: { label: 'Iniciar', value: 'ACTIVE', severity: 'success' },
        ACTIVE: { label: 'Completar', value: 'COMPLETED', severity: 'info' },
        COMPLETED: { label: 'Completado', value: 'COMPLETED', severity: 'secondary' },
        CANCELLED: { label: 'Cancelado', value: 'CANCELLED', severity: 'secondary' }
    };

    readonly schoolYears = MOCK_SCHOOL_YEARS;

    private destroy$ = new Subject<void>();

    constructor(
        private eventsService: EventsService,
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

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadReferenceData(): void {
        this.eventsService
            .getEventTypes()
            .pipe(takeUntil(this.destroy$))
            .subscribe((t) => this.eventTypes.set(t));

        this.eventsService
            .getEventStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    loadEvents(): void {
        this.loadingEvents.set(true);
        const f: EventFilter = {};
        if (this.searchEvent) f.search = this.searchEvent;
        if (this.filterStatus) f.status = this.filterStatus;
        if (this.filterType) f.idEventType = this.filterType;
        if (this.filterScope) f.scope = this.filterScope;

        this.eventsService
            .getEvents(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.events.set(data);
                this.loadingEvents.set(false);
            });
    }

    loadCalendar(): void {
        this.loadingCalendar.set(true);
        this.eventsService
            .getEventsByMonth(this.calendarYear(), this.calendarMonth())
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.calendarEvents.set(data);
                this.loadingCalendar.set(false);
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

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

    openDetail(event: EventMock): void {
        this.loadingDetail.set(true);
        this.showDetail.set(true);
        this.eventsService
            .getEventById(event.idEvent)
            .pipe(takeUntil(this.destroy$))
            .subscribe((e) => {
                this.selectedEvent.set(e ?? null);
                this.loadingDetail.set(false);
            });
    }

    closeDetail(): void {
        this.showDetail.set(false);
        this.selectedEvent.set(null);
    }

    // ── Cambio de estado ──────────────────────────────────────────────────────

    changeStatus(event: EventMock, newStatus: string): void {
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
                    .subscribe(() => {
                        this.loadEvents();
                        if (this.selectedEvent()?.idEvent === event.idEvent) {
                            this.openDetail(event);
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Estado actualizado',
                            detail: `Evento marcado como ${this.getStatusLabel(newStatus)}`
                        });
                    });
            }
        });
    }

    cancelEvent(event: EventMock): void {
        this.confirmationService.confirm({
            message: `¿Cancelar el evento "${event.name}"? Esta acción no se puede deshacer.`,
            header: 'Cancelar evento',
            icon: 'pi pi-exclamation-triangle',
            // acceptSeverity: 'danger',
            accept: () => {
                this.eventsService
                    .updateStatus(event.idEvent, 'CANCELLED')
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.loadEvents();
                        this.messageService.add({ severity: 'warn', summary: 'Evento cancelado' });
                    });
            }
        });
    }

    // ── Nuevo Evento ──────────────────────────────────────────────────────────

    private buildForm(): void {
        this.eventForm = this.fb.group({
            idEventType: [null, Validators.required],
            idSchoolYear: [1, Validators.required],
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
        this.eventForm.reset({ scope: 'GENERAL', requiresPayment: false, idSchoolYear: 1 });
        this.showEventForm.set(true);
    }

    submitEvent(): void {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            return;
        }
        this.loadingForm.set(true);
        const v = this.eventForm.value;

        const req: CreateEventRequest = {
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
                next: () => {
                    this.loadingForm.set(false);
                    this.showEventForm.set(false);
                    this.loadEvents();
                    this.loadCalendar();
                    this.loadReferenceData();
                    this.messageService.add({ severity: 'success', summary: 'Evento creado', detail: req.name });
                },
                error: () => this.loadingForm.set(false)
            });
    }

    // ── Inscripciones ─────────────────────────────────────────────────────────

    selectEventForReg(event: EventMock): void {
        this.selectedEventForReg.set(event);
        this.loadRegistrations(event.idEvent);
    }

    loadRegistrations(idEvent: number): void {
        this.loadingReg.set(true);
        this.eventsService
            .getRegistrationsByEvent(idEvent)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.registrations.set(r);
                this.loadingReg.set(false);
            });
    }

    openRegDialog(): void {
        if (!this.selectedEventForReg()) return;
        this.eventsService
            .getAvailableStudents(this.selectedEventForReg()!.idEvent)
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => {
                this.availableStudents.set(s);
                this.selectedStudentToReg = null;
                this.regNotes = '';
                this.showRegDialog.set(true);
            });
    }

    submitRegistration(): void {
        if (!this.selectedStudentToReg || !this.selectedEventForReg()) return;
        this.eventsService
            .registerStudent({
                idEvent: this.selectedEventForReg()!.idEvent,
                idStudent: this.selectedStudentToReg.idStudent,
                notes: this.regNotes || undefined
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.showRegDialog.set(false);
                    this.loadRegistrations(this.selectedEventForReg()!.idEvent);
                    this.loadEvents();
                    this.messageService.add({ severity: 'success', summary: 'Alumno inscripto' });
                }
            });
    }

    cancelReg(reg: EventRegistrationMock): void {
        this.confirmationService.confirm({
            message: `¿Cancelar inscripción de ${reg.studentName}?`,
            header: 'Cancelar inscripción',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eventsService
                    .cancelRegistration(reg.idEventRegistration)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.loadRegistrations(reg.idEvent);
                        this.messageService.add({ severity: 'warn', summary: 'Inscripción cancelada' });
                    });
            }
        });
    }

    // ── Calendario ────────────────────────────────────────────────────────────

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
        const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Dom
        const daysInMonth = new Date(year, month, 0).getDate();
        // Ajustar: semana empieza en Lunes (0=Lun … 6=Dom)
        const offset = firstDay === 0 ? 6 : firstDay - 1;
        const days: (number | null)[] = Array(offset).fill(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        // Rellenar hasta múltiplo de 7
        while (days.length % 7 !== 0) days.push(null);
        return days;
    }

    getEventsForDay(day: number): EventMock[] {
        const dateStr = `${this.calendarYear()}-${String(this.calendarMonth()).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return this.calendarEvents().filter((e) => e.eventDate === dateStr);
    }

    isToday(day: number): boolean {
        const today = new Date();
        return today.getFullYear() === this.calendarYear() && today.getMonth() + 1 === this.calendarMonth() && today.getDate() === day;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getStatusLabel(s: string): string {
        const m: Record<string, string> = {
            PLANNED: 'Planificado',
            ACTIVE: 'Activo',
            COMPLETED: 'Completado',
            CANCELLED: 'Cancelado'
        };
        return m[s] ?? s;
    }

    getStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            PLANNED: 'info',
            ACTIVE: 'success',
            COMPLETED: 'secondary',
            CANCELLED: 'danger'
        };
        return m[s] ?? 'secondary';
    }

    getScopeLabel(s: string): string {
        const m: Record<string, string> = { GENERAL: 'General', GRADE: 'Grado', SECTION: 'Sección' };
        return m[s] ?? s;
    }

    getRegStatusLabel(s: string): string {
        const m: Record<string, string> = {
            REGISTERED: 'Inscripto',
            CONFIRMED: 'Confirmado',
            CANCELLED: 'Cancelado',
            ATTENDED: 'Asistió'
        };
        return m[s] ?? s;
    }

    getRegStatusSeverity(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const m: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            REGISTERED: 'info',
            CONFIRMED: 'success',
            CANCELLED: 'danger',
            ATTENDED: 'contrast'
        };
        return m[s] ?? 'secondary';
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

    get studentOptions(): { label: string; value: StudentMock }[] {
        return this.availableStudents().map((s) => ({
            label: `${s.fullName} — ${s.gradeName} ${s.sectionName}`,
            value: s
        }));
    }

    get eventOptions(): { label: string; value: EventMock }[] {
        return this.events().map((e) => ({ label: `${e.name} (${e.eventDate})`, value: e }));
    }

    get typeFormOptions(): { label: string; value: number }[] {
        return this.eventTypes().map((t) => ({ label: t.name, value: t.idEventType }));
    }

    get schoolYearOptions(): { label: string; value: number }[] {
        return MOCK_SCHOOL_YEARS.map((y) => ({ label: y.name, value: y.idSchoolYear }));
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
