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
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services — paths migrados a /api/
import { AccessControlService, AccessFilter } from '../../core/services/api/access-control.service';
import { QrAccessService, AccessMode } from '../../core/services/api/qr-access.service';
import { StudentsService } from '../../core/services/api/students.service';
import { StaffService } from '../../core/services/api/staff.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models
import { StudentAccessLogResponse, StaffAccessLogResponse, StudentInfractionResponse, EarlyDepartureResponse, OperationsStatsResponse } from '../../core/models/operations.models';
import { QrScanResultResponse } from '../../core/models/qr.models';
import { StaffResponse } from '../../core/models/staff.models';

// Dialogs
import { AccessLogDialogComponent } from '../../shared/components/access/access-log-dialog/access-log-dialog.component';
import { EarlyDepartureDialogComponent } from '../../shared/components/access/early-departure-dialog/early-departure-dialog.component';
import { InfractionDialogComponent } from '../../shared/components/access/infraction-dialog/infraction-dialog.component';
import { StudentResponse } from '../../core/models/student.dto';

interface QrLogItem {
    name: string;
    grade: string;
    mode: AccessMode;
    time: string;
    success: boolean;
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
        ZXingScannerModule,
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
    activeTab = signal('0');
    selectedDate = signal<Date>(new Date());
    stats = signal<OperationsStatsResponse | null>(null);

    // ── Tab 1: Acceso Estudiantes ─────────────────────────────────────────────
    studentLogs = signal<StudentAccessLogResponse[]>([]);
    loadingStudent = signal(false);
    searchStudent = '';

    // ── Tab 2: Acceso Personal ────────────────────────────────────────────────
    staffLogs = signal<StaffAccessLogResponse[]>([]);
    loadingStaff = signal(false);
    searchStaff = '';

    // ── Tab 3: Ausentes ───────────────────────────────────────────────────────
    absentStudents = signal<StudentAccessLogResponse[]>([]);
    loadingAbsents = signal(false);

    // ── Tab 4: Retiros anticipados ────────────────────────────────────────────
    earlyDepartures = signal<EarlyDepartureResponse[]>([]);
    loadingDeps = signal(false);
    searchDeps = '';

    // ── Tab 5: Infracciones ───────────────────────────────────────────────────
    infractions = signal<StudentInfractionResponse[]>([]);
    loadingInf = signal(false);
    searchInf = '';

    // ── Tab 6: Escáner QR ─────────────────────────────────────────────────────
    qrScannerActive = signal(false);
    qrScanMode = signal<AccessMode>('ENTRADA');
    qrHasCamera = signal(false);
    qrCameras = signal<MediaDeviceInfo[]>([]);
    qrSelectedCamera = signal<MediaDeviceInfo | undefined>(undefined);
    qrScanResult = signal<QrScanResultResponse | null>(null);
    qrFlashOk = signal(false);
    qrFlashErr = signal(false);
    qrScanCount = signal(0);
    qrScanLog = signal<QrLogItem[]>([]);
    readonly qrFormats = [BarcodeFormat.QR_CODE];
    private qrFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
    private qrRecentScans = new Map<string, number>();

    // ── Modales ───────────────────────────────────────────────────────────────
    showAccessDialog = signal(false);
    showDepartureDialog = signal(false);
    showInfractionDialog = signal(false);
    accessDialogType = signal<'STUDENT' | 'STAFF'>('STUDENT');

    // Datos para los diálogos — cargados del backend
    students = signal<StudentResponse[]>([]);
    staff = signal<StaffResponse[]>([]);

    private destroy$ = new Subject<void>();

    constructor(
        private accessService: AccessControlService,
        private qrService: QrAccessService,
        private studentsService: StudentsService,
        private staffService: StaffService,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDialogData();
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.qrFeedbackTimer) clearTimeout(this.qrFeedbackTimer);
    }

    // ── Carga de datos para diálogos ──────────────────────────────────────────

    private loadDialogData(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        // Estudiantes activos para los dialogs (sin paginación, tamaño grande)
        this.studentsService
            .getAll(idCompany, { size: 500 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.students.set(res.data?.content ?? []);
                }
            });

        // Personal activo para los dialogs
        this.staffService
            .getAll(idCompany, { size: 200 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.staff.set(res.data?.content ?? []);
                }
            });
    }

    // ── Carga principal ───────────────────────────────────────────────────────

    loadAll(): void {
        this.loadStats();
        this.loadStudentLogs();
        this.loadStaffLogs();
        this.loadAbsents();
        this.loadEarlyDepartures();
        this.loadInfractions();
    }

    loadStats(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.accessService
            .getTodayStats(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                }
            });
    }

    loadStudentLogs(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingStudent.set(true);
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchStudent) f.search = this.searchStudent;
        this.accessService
            .getStudentLogs(idCompany, f)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.studentLogs.set(res.success ? (res.data ?? []) : []);
                    this.loadingStudent.set(false);
                },
                error: () => this.loadingStudent.set(false)
            });
    }

    loadStaffLogs(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingStaff.set(true);
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchStaff) f.search = this.searchStaff;
        this.accessService
            .getStaffLogs(idCompany, f)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.staffLogs.set(res.success ? (res.data ?? []) : []);
                    this.loadingStaff.set(false);
                },
                error: () => this.loadingStaff.set(false)
            });
    }

    loadAbsents(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingAbsents.set(true);
        // Filtramos los ausentes del día desde los logs de estudiantes
        this.accessService
            .getStudentLogs(idCompany, { date: this.dateStr })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const all = res.success ? (res.data ?? []) : [];
                    this.absentStudents.set(all.filter((l) => l.isAbsent));
                    this.loadingAbsents.set(false);
                },
                error: () => this.loadingAbsents.set(false)
            });
    }

    loadEarlyDepartures(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingDeps.set(true);
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchDeps) f.search = this.searchDeps;
        this.accessService
            .getEarlyDepartures(idCompany, f)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.earlyDepartures.set(res.success ? (res.data?.content ?? []) : []);
                    this.loadingDeps.set(false);
                },
                error: () => this.loadingDeps.set(false)
            });
    }

    loadInfractions(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;
        this.loadingInf.set(true);
        this.accessService
            .getInfractions(idCompany, { size: 100 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.infractions.set(res.success ? (res.data?.content ?? []) : []);
                    this.loadingInf.set(false);
                },
                error: () => this.loadingInf.set(false)
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onDateChange(): void {
        this.loadStudentLogs();
        this.loadStaffLogs();
        this.loadAbsents();
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
    refreshAll(): void {
        this.loadAll();
    }

    onTabChange(val: string): void {
        const prev = this.activeTab();
        this.activeTab.set(val ?? '0');
        if (val === '5') this.activateQrScanner();
        else if (prev === '5') this.deactivateQrScanner();
    }

    // ── QR Scanner ────────────────────────────────────────────────────────────

    onQrCamerasFound(devices: MediaDeviceInfo[]): void {
        this.qrCameras.set(devices);
        this.qrHasCamera.set(devices.length > 0);
        const rear = devices.find((d) => /back|rear|trasera|environment/i.test(d.label));
        this.qrSelectedCamera.set(rear ?? devices[0]);
    }

    onQrCamerasNotFound(): void {
        this.qrHasCamera.set(false);
    }

    onQrCodeScanned(token: string): void {
        if (!this.qrScannerActive()) return;
        const last = this.qrRecentScans.get(token);
        if (last && Date.now() - last < 3000) return;
        this.qrRecentScans.set(token, Date.now());

        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.qrService
            .scan(token, this.qrScanMode(), idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => this.handleQrResult(res.data ?? null));
    }

    private handleQrResult(result: QrScanResultResponse | null): void {
        if (!result || result.isDuplicate) return;
        if (this.qrFeedbackTimer) clearTimeout(this.qrFeedbackTimer);
        this.qrScanResult.set(result);

        if (result.success) {
            this.qrFlashOk.set(true);
            setTimeout(() => this.qrFlashOk.set(false), 700);
            this.qrScanCount.update((c) => c + 1);
            this.qrScanLog.update((log) =>
                [
                    {
                        name: result.fullName ?? '–',
                        grade: result.displayLabel ?? '',
                        mode: this.qrScanMode(),
                        time: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        success: true
                    },
                    ...log
                ].slice(0, 50)
            );
            this.messageService.add({
                severity: 'success',
                summary: this.getQrModeLabel(this.qrScanMode()),
                detail: `${result.fullName} — ${result.message}`,
                life: 2500
            });
            this.loadStats();
            this.loadStudentLogs();
            this.loadStaffLogs();
        } else {
            this.qrFlashErr.set(true);
            setTimeout(() => this.qrFlashErr.set(false), 700);
            this.messageService.add({
                severity: result.blocked ? 'warn' : 'error',
                summary: result.blocked ? 'Registro no permitido' : 'QR no reconocido',
                detail: result.fullName ? `${result.fullName} — ${result.message}` : result.message,
                life: 4000
            });
        }
        this.qrFeedbackTimer = setTimeout(() => this.qrScanResult.set(null), 3000);
    }

    onQrScanError(_err: any): void {
        /* ignorar errores de frame */
    }

    setQrMode(mode: AccessMode): void {
        this.qrScanMode.set(mode);
    }
    activateQrScanner(): void {
        this.qrScannerActive.set(true);
    }
    deactivateQrScanner(): void {
        this.qrScannerActive.set(false);
        this.qrScanResult.set(null);
    }
    clearQrLog(): void {
        this.qrScanLog.set([]);
        this.qrScanCount.set(0);
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
        this.messageService.add({ severity: 'success', summary: 'Acceso registrado', detail: 'Registro guardado correctamente' });
    }
    onDepartureSaved(): void {
        this.showDepartureDialog.set(false);
        this.loadEarlyDepartures();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'Retiro registrado', detail: 'Retiro anticipado guardado' });
    }
    onInfractionSaved(): void {
        this.showInfractionDialog.set(false);
        this.loadInfractions();
        this.loadStats();
        this.messageService.add({ severity: 'success', summary: 'Infracción registrada', detail: 'Infracción guardada correctamente' });
    }
    onDialogClosed(): void {
        this.showAccessDialog.set(false);
        this.showDepartureDialog.set(false);
        this.showInfractionDialog.set(false);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get dateStr(): string {
        return this.selectedDate().toISOString().split('T')[0];
    }
    get isToday(): boolean {
        return this.dateStr === new Date().toISOString().split('T')[0];
    }

    formatDatetime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    formatTime(dt?: string | null): string {
        if (!dt) return '–';
        return new Date(dt).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    }

    getQrModeLabel(mode: string): string {
        return ({ ENTRADA: 'Entrada', RETIRO: 'Retiro', SALIDA: 'Salida' } as Record<string, string>)[mode] ?? mode;
    }
    getQrModeColor(mode: string): string {
        return ({ ENTRADA: '#22c55e', RETIRO: '#f59e0b', SALIDA: '#ef4444' } as Record<string, string>)[mode] ?? '#6366f1';
    }
    getStaffTypeLabel(type: string): string {
        return ({ TEACHER: 'Docente', ADMINISTRATIVE: 'Administrativo', DIRECTOR: 'Director', SUPPORT: 'Soporte' } as Record<string, string>)[type] ?? type;
    }

    getStaffTypeSeverity(type: string): 'info' | 'success' | 'contrast' | 'secondary' {
        const staffSeverityMap = {
            TEACHER: 'info',
            ADMINISTRATIVE: 'success',
            DIRECTOR: 'contrast',
            SUPPORT: 'secondary'
        } as const;

        return staffSeverityMap[type as keyof typeof staffSeverityMap] ?? 'secondary';
    }
    getSeverityLabel(s: string): string {
        return ({ LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' } as Record<string, string>)[s] ?? s;
    }

    getSeverityTag(s: string): 'info' | 'warn' | 'danger' | 'contrast' | 'secondary' {
        const severityMap = {
            LOW: 'info',
            MEDIUM: 'warn',
            HIGH: 'danger',
            CRITICAL: 'contrast'
        } as const;

        return severityMap[s as keyof typeof severityMap] ?? 'secondary';
    }
    getRelationshipLabel(rel: string): string {
        return (
            (
                {
                    FATHER: 'Padre',
                    MOTHER: 'Madre',
                    LEGAL_GUARDIAN: 'Tutor Legal',
                    GRANDPARENT: 'Abuelo/a',
                    UNCLE_AUNT: 'Tío/a',
                    SIBLING: 'Hermano/a',
                    OTHER: 'Otro'
                } as Record<string, string>
            )[rel] ?? rel
        );
    }
}
