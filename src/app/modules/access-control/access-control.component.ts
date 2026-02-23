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

import { AccessControlService, AccessFilter } from '../../core/services/conf/access-control.service';
import { StudentAccessLogMock, StaffAccessLogMock, StudentInfractionMock, EarlyDepartureMock } from '../../shared/data/operations.mock';
import { AccessLogDialogComponent } from '../../shared/components/access/access-log-dialog/access-log-dialog.component';
import { EarlyDepartureDialogComponent } from '../../shared/components/access/early-departure-dialog/early-departure-dialog.component';
import { MOCK_STUDENTS } from '../../shared/data/people.mock';
import { MOCK_STAFF } from '../../shared/data/staff.mock';
import { InfractionDialogComponent } from '../../shared/components/access/infraction-dialog/infraction-dialog.component';
import { QrAccessService, ScanResult } from '../../core/services/conf/qr-access.service';

export type AccessMode = 'ENTRADA' | 'RETIRO' | 'SALIDA';

interface DayStats {
    studentsPresentToday: number;
    studentsAbsentToday: number;
    studentsLateToday: number;
    staffPresentToday: number;
    staffAbsentToday: number;
    earlyDeparturesToday: number;
    infractionsPending: number;
}

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
    stats = signal<DayStats | null>(null);

    // ── Tab 1: Acceso Estudiantes ─────────────────────────────────────────────
    studentLogs = signal<StudentAccessLogMock[]>([]);
    loadingStudent = signal(false);
    searchStudent = '';

    // ── Tab 2: Acceso Personal ────────────────────────────────────────────────
    staffLogs = signal<StaffAccessLogMock[]>([]);
    loadingStaff = signal(false);
    searchStaff = '';

    // ── Tab 3: Ausentes ───────────────────────────────────────────────────────
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

    // ── Tab 6: Escáner QR ─────────────────────────────────────────────────────
    qrScannerActive = signal(false);
    qrScanMode = signal<AccessMode>('ENTRADA');
    qrHasCamera = signal(false);
    qrCameras = signal<MediaDeviceInfo[]>([]);
    qrSelectedCamera = signal<MediaDeviceInfo | undefined>(undefined);
    qrScanResult = signal<ScanResult | null>(null);
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

    readonly students = MOCK_STUDENTS.filter((s) => s.isActive);
    readonly staff = MOCK_STAFF.filter((s) => s.isActive);

    private destroy$ = new Subject<void>();

    constructor(
        private accessService: AccessControlService,
        private qrService: QrAccessService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.qrFeedbackTimer) clearTimeout(this.qrFeedbackTimer);
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

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
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchStudent) f.search = this.searchStudent;
        this.accessService
            .getStudentLogs(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.studentLogs.set(r);
                this.loadingStudent.set(false);
            });
    }
    loadStaffLogs(): void {
        this.loadingStaff.set(true);
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchStaff) f.search = this.searchStaff;
        this.accessService
            .getStaffLogs(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.staffLogs.set(r);
                this.loadingStaff.set(false);
            });
    }
    loadAbsents(): void {
        this.loadingAbsents.set(true);
        this.accessService
            .getTodayAbsents()
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.absentStudents.set(r);
                this.loadingAbsents.set(false);
            });
    }
    loadEarlyDepartures(): void {
        this.loadingDeps.set(true);
        const f: AccessFilter = { date: this.dateStr };
        if (this.searchDeps) f.search = this.searchDeps;
        this.accessService
            .getEarlyDepartures(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.earlyDepartures.set(r);
                this.loadingDeps.set(false);
            });
    }
    loadInfractions(): void {
        this.loadingInf.set(true);
        const f: AccessFilter = {};
        if (this.searchInf) f.search = this.searchInf;
        this.accessService
            .getInfractions(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((r) => {
                this.infractions.set(r);
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

        this.qrService
            .registerAccess(token, this.qrScanMode())
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => this.handleQrResult(result));
    }

    private handleQrResult(result: ScanResult): void {
        if (result.isDuplicate) return;
        if (this.qrFeedbackTimer) clearTimeout(this.qrFeedbackTimer);
        this.qrScanResult.set(result);

        if (result.success && result.person) {
            this.qrFlashOk.set(true);
            setTimeout(() => this.qrFlashOk.set(false), 700);
            this.qrScanCount.update((c) => c + 1);
            this.qrScanLog.update((log) =>
                [
                    {
                        name: result.person!.fullName,
                        grade: result.person!.displayLabel,
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
                detail: `${result.person.fullName} — ${result.message}`,
                life: 2500
            });
            this.loadStats();
            this.loadStudentLogs();
            this.loadStaffLogs();
        } else {
            this.qrFlashErr.set(true);
            setTimeout(() => this.qrFlashErr.set(false), 700);
            // Toast de advertencia con el motivo exacto
            this.messageService.add({
                severity: result.alreadyDone ? 'warn' : 'error',
                summary: result.alreadyDone ? 'Registro no permitido' : 'QR no reconocido',
                detail: result.person ? `${result.person.fullName} — ${result.message}` : result.message,
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
        return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    formatTime(dt?: string): string {
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
    getStaffTypeSeverity(type: string): any {
        return ({ TEACHER: 'info', ADMINISTRATIVE: 'success', DIRECTOR: 'contrast', SUPPORT: 'secondary' } as Record<string, string>)[type] ?? 'secondary';
    }
    getSeverityLabel(s: string): string {
        return ({ LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' } as Record<string, string>)[s] ?? s;
    }
    getSeverityTag(s: string): any {
        return ({ LOW: 'info', MEDIUM: 'warn', HIGH: 'danger', CRITICAL: 'contrast' } as Record<string, string>)[s] ?? 'secondary';
    }
    getRelationshipLabel(rel: string): string {
        return ({ FATHER: 'Padre', MOTHER: 'Madre', LEGAL_GUARDIAN: 'Tutor Legal', GRANDPARENT: 'Abuelo/a', UNCLE_AUNT: 'Tío/a', SIBLING: 'Hermano/a', OTHER: 'Otro' } as Record<string, string>)[rel] ?? rel;
    }
}
