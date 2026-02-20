// src/app/modules/access-control/access-control.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccessControlService, AccessFilter } from '../../core/services/conf/access-control.service';
import { StudentAccessLogMock, StaffAccessLogMock, StudentInfractionMock, EarlyDepartureMock } from '../../shared/data/operations.mock';
import { AccessLogDialogComponent } from '../../shared/components/access/access-log-dialog/access-log-dialog.component';
import { EarlyDepartureDialogComponent } from '../../shared/components/access/early-departure-dialog/early-departure-dialog.component';
import { MOCK_STUDENTS } from '../../shared/data/people.mock';
import { MOCK_STAFF } from '../../shared/data/staff.mock';
import { InfractionDialogComponent } from '../../shared/components/access/infraction-dialog/infraction-dialog.component';

interface DayStats {
    studentsPresentToday: number;
    studentsAbsentToday: number;
    studentsLateToday: number;
    staffPresentToday: number;
    staffAbsentToday: number;
    earlyDeparturesToday: number;
    infractionsPending: number;
}

@Component({
    selector: 'app-access-control',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        DatePickerModule,
        TagModule,
        TabsModule,
        TableModule,
        SkeletonModule,
        ButtonModule,
        TooltipModule,
        ToastModule,
        AccessLogDialogComponent,
        EarlyDepartureDialogComponent,
        InfractionDialogComponent
    ],
    templateUrl: './access-control.component.html',
    styleUrl: './access-control.component.scss',
    providers: [MessageService]
})
export class AccessControlComponent implements OnInit, OnDestroy {
    // ── Estado general ────────────────────────────────────────────────────────
    loading = signal(false);
    activeTab = signal('0');
    selectedDate = signal<Date>(new Date());
    stats = signal<DayStats | null>(null);

    // ── Tab 1: Acceso Estudiantes ─────────────────────────────────────────────
    studentLogs = signal<StudentAccessLogMock[]>([]);
    loadingStudent = signal(false);
    searchStudent = '';

    // ── Tab 2: Acceso Personal ────────────────────────────────────────────────
    staffLogs = signal<StaffAccessLogMock[]>([]);
    loadingStaff = signal(false);
    searchStaff = '';

    // ── Tab 3: Ausentes del día ───────────────────────────────────────────────
    absentStudents = signal<StudentAccessLogMock[]>([]);
    loadingAbsents = signal(false);

    // ── Tab 4: Retiros anticipados ────────────────────────────────────────────
    earlyDepartures = signal<EarlyDepartureMock[]>([]);
    loadingDeps = signal(false);
    searchDeps = '';

    // ── Tab 5: Infracciones ───────────────────────────────────────────────────
    infractions = signal<StudentInfractionMock[]>([]);
    loadingInf = signal(false);
    searchInf = '';

    // ── Modales ───────────────────────────────────────────────────────────────
    showAccessDialog = signal(false);
    showDepartureDialog = signal(false);
    showInfractionDialog = signal(false);
    accessDialogType = signal<'STUDENT' | 'STAFF'>('STUDENT');

    // Datos para modales
    readonly students = MOCK_STUDENTS.filter((s) => s.isActive);
    readonly staff = MOCK_STAFF.filter((s) => s.isActive);

    private destroy$ = new Subject<void>();

    constructor(
        private accessService: AccessControlService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga de datos ────────────────────────────────────────────────────────

    loadAll(): void {
        this.loadStats();
        this.loadStudentLogs();
        this.loadStaffLogs();
        this.loadAbsents();
        this.loadEarlyDepartures();
        this.loadInfractions();
    }

    loadStats(): void {
        this.accessService
            .getTodayStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    loadStudentLogs(): void {
        this.loadingStudent.set(true);
        const filter: AccessFilter = { date: this.dateStr };
        if (this.searchStudent) filter.search = this.searchStudent;

        this.accessService
            .getStudentLogs(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe((logs) => {
                this.studentLogs.set(logs);
                this.loadingStudent.set(false);
            });
    }

    loadStaffLogs(): void {
        this.loadingStaff.set(true);
        const filter: AccessFilter = { date: this.dateStr };
        if (this.searchStaff) filter.search = this.searchStaff;

        this.accessService
            .getStaffLogs(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe((logs) => {
                this.staffLogs.set(logs);
                this.loadingStaff.set(false);
            });
    }

    loadAbsents(): void {
        this.loadingAbsents.set(true);
        this.accessService
            .getTodayAbsents()
            .pipe(takeUntil(this.destroy$))
            .subscribe((list) => {
                this.absentStudents.set(list);
                this.loadingAbsents.set(false);
            });
    }

    loadEarlyDepartures(): void {
        this.loadingDeps.set(true);
        const filter: AccessFilter = { date: this.dateStr };
        if (this.searchDeps) filter.search = this.searchDeps;

        this.accessService
            .getEarlyDepartures(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe((list) => {
                this.earlyDepartures.set(list);
                this.loadingDeps.set(false);
            });
    }

    loadInfractions(): void {
        this.loadingInf.set(true);
        const filter: AccessFilter = {};
        if (this.searchInf) filter.search = this.searchInf;

        this.accessService
            .getInfractions(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe((list) => {
                this.infractions.set(list);
                this.loadingInf.set(false);
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onDateChange(): void {
        this.loadStudentLogs();
        this.loadStaffLogs();
        this.loadEarlyDepartures();
        this.loadStats();
    }
    onSearchStudent(): void {
        this.loadStudentLogs();
    }
    onSearchStaff(): void {
        this.loadStaffLogs();
    }
    onSearchDeps(): void {
        this.loadEarlyDepartures();
    }
    onSearchInf(): void {
        this.loadInfractions();
    }

    // ── Modales ───────────────────────────────────────────────────────────────

    openAccessStudent(): void {
        this.accessDialogType.set('STUDENT');
        this.showAccessDialog.set(true);
    }
    openAccessStaff(): void {
        this.accessDialogType.set('STAFF');
        this.showAccessDialog.set(true);
    }

    openDepartureDialog(): void {
        this.showDepartureDialog.set(true);
    }
    openInfractionDialog(): void {
        this.showInfractionDialog.set(true);
    }

    onAccessSaved(): void {
        this.showAccessDialog.set(false);
        this.loadStudentLogs();
        this.loadStaffLogs();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'Acceso registrado', detail: 'El registro de acceso fue guardado correctamente' });
    }

    onDepartureSaved(): void {
        this.showDepartureDialog.set(false);
        this.loadEarlyDepartures();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'Retiro registrado', detail: 'El retiro anticipado fue registrado correctamente' });
    }

    onInfractionSaved(): void {
        this.showInfractionDialog.set(false);
        this.loadInfractions();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'Infracción registrada', detail: 'La infracción fue registrada correctamente' });
    }

    onDialogClosed(): void {
        this.showAccessDialog.set(false);
        this.showDepartureDialog.set(false);
        this.showInfractionDialog.set(false);
    }

    refreshAll(): void {
        this.loadAll();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get dateStr(): string {
        return this.selectedDate().toISOString().split('T')[0];
    }

    get isToday(): boolean {
        return this.dateStr === new Date().toISOString().split('T')[0];
    }

    formatDatetime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    formatTime(dt?: string): string {
        if (!dt) return '–';
        return new Date(dt).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            ACTIVE: 'success',
            INACTIVE: 'danger',
            GRADUATED: 'info',
            TRANSFERRED: 'warn',
            WITHDRAWN: 'secondary'
        };
        return map[status] ?? 'secondary';
    }

    getStaffTypeLabel(type: string): string {
        const map: Record<string, string> = { TEACHER: 'Docente', ADMINISTRATIVE: 'Administrativo', DIRECTOR: 'Director', SUPPORT: 'Soporte' };
        return map[type] ?? type;
    }

    getStaffTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            TEACHER: 'info',
            ADMINISTRATIVE: 'success',
            DIRECTOR: 'contrast',
            SUPPORT: 'secondary'
        };
        return map[type] ?? 'secondary';
    }

    getSeverityLabel(s: string): string {
        const map: Record<string, string> = { LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' };
        return map[s] ?? s;
    }

    getSeverityTag(s: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            LOW: 'info',
            MEDIUM: 'warn',
            HIGH: 'danger',
            CRITICAL: 'contrast'
        };
        return map[s] ?? 'secondary';
    }

    getRelationshipLabel(rel: string): string {
        const map: Record<string, string> = { FATHER: 'Padre', MOTHER: 'Madre', LEGAL_GUARDIAN: 'Tutor Legal', GRANDPARENT: 'Abuelo/a', UNCLE_AUNT: 'Tío/a', SIBLING: 'Hermano/a', OTHER: 'Otro' };
        return map[rel] ?? rel;
    }
}
