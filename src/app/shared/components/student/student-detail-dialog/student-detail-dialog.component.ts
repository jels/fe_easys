// src/app/shared/components/student/student-detail-dialog/student-detail-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

// Services — paths migrados a /api/
import { StudentsService } from '../../../../core/services/api/students.service';
import { AcademicsService } from '../../../../core/services/api/academics.service';
import { AuthService } from '../../../../core/services/api/auth.service';

// Models
import { GradeScoreResponse } from '../../../../core/models/academic.models';
import { StudentParentResponse, StudentResponse } from '../../../../core/models/student.dto';
import { PaymentInstallmentResponse, StudentAccessLogResponse, StudentInfractionResponse } from '../../../../core/models/operations.models';
import { OperationsService } from '../../../../core/services/api/operations.service';
import { PaymentsService } from '../../../../core/services/api/payments.service';

@Component({
    selector: 'app-student-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TableModule, ConfirmDialogModule, TooltipModule, DividerModule],
    templateUrl: './student-detail-dialog.component.html',
    styleUrl: './student-detail-dialog.component.scss'
})
export class StudentDetailDialogComponent implements OnChanges, OnDestroy {
    activeTab = signal('0');

    @Input() studentId: number | null = null;
    @Input() visible = false;

    @Output() onEdit = new EventEmitter<StudentResponse>();
    @Output() onClose = new EventEmitter<void>();

    // Signals tipadas con los modelos reales del backend
    student = signal<StudentResponse | null>(null);
    parents = signal<StudentParentResponse[]>([]);
    accessLogs = signal<StudentAccessLogResponse[]>([]);
    infractions = signal<StudentInfractionResponse[]>([]);
    scores = signal<GradeScoreResponse[]>([]);
    installments = signal<PaymentInstallmentResponse[]>([]);

    loading = signal(false);
    loadingParents = signal(false);
    loadingScores = signal(false);
    loadingPayments = signal(false);

    private destroy$ = new Subject<void>();

    constructor(
        private studentsService: StudentsService,
        private operationsService: OperationsService,
        private paymentsService: PaymentsService,
        private academicsService: AcademicsService,
        private authService: AuthService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.studentId) {
            this.loadAll(this.studentId);
        }
        if (changes['visible']?.currentValue === false) {
            this.clearData();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Data loading ──────────────────────────────────────────────────────────

    private loadAll(id: number): void {
        this.loading.set(true);
        this.loadingParents.set(true);
        this.loadingScores.set(true);
        this.loadingPayments.set(true);

        const idCompany = this.authService.idCompany;

        // ── Alumno principal ──────────────────────────────────────────────────
        this.studentsService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.student.set(res.success ? (res.data ?? null) : null);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });

        // ── Padres / tutores ──────────────────────────────────────────────────
        // GET /api/v1/students/{id}/parents
        this.studentsService
            .getParents(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.parents.set(res.success ? (res.data ?? []) : []);
                    this.loadingParents.set(false);
                },
                error: () => this.loadingParents.set(false)
            });

        // ── Logs de acceso ────────────────────────────────────────────────────
        // GET /api/v1/operations/access/students/by-student/{id}
        this.operationsService
            .getStudentAccessLogsByStudent(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => this.accessLogs.set(res.success ? (res.data ?? []) : []),
                error: () => this.accessLogs.set([])
            });

        // ── Infracciones ──────────────────────────────────────────────────────
        // GET /api/v1/operations/infractions?idCompany=&idStudent=
        if (idCompany) {
            this.operationsService
                .getInfractions(idCompany, { idStudent: id })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => this.infractions.set(res.success ? (res.data?.content ?? []) : []),
                    error: () => this.infractions.set([])
                });
        }

        // ── Cuotas del alumno ─────────────────────────────────────────────────
        // GET /api/v1/payments/installments/by-student/{id}
        this.paymentsService
            .getInstallmentsByStudent(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.installments.set(res.success ? (res.data ?? []) : []);
                    this.loadingPayments.set(false);
                },
                error: () => this.loadingPayments.set(false)
            });
    }

    private clearData(): void {
        this.student.set(null);
        this.parents.set([]);
        this.accessLogs.set([]);
        this.infractions.set([]);
        this.scores.set([]);
        this.installments.set([]);
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    editStudent(): void {
        const s = this.student();
        if (s) this.onEdit.emit(s);
    }

    close(): void {
        this.onClose.emit();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get fullName(): string {
        const s = this.student();
        return s?.person.fullName ?? '';
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

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            ACTIVE: 'Activo',
            INACTIVE: 'Inactivo',
            GRADUATED: 'Egresado',
            TRANSFERRED: 'Transferido',
            WITHDRAWN: 'Retirado'
        };
        return map[status] ?? status;
    }

    getRelationshipLabel(rel: string): string {
        const map: Record<string, string> = {
            FATHER: 'Padre',
            MOTHER: 'Madre',
            LEGAL_GUARDIAN: 'Tutor Legal',
            GRANDPARENT: 'Abuelo/a',
            UNCLE_AUNT: 'Tío/a',
            SIBLING: 'Hermano/a',
            OTHER: 'Otro'
        };
        return map[rel] ?? rel;
    }

    getSeverityLabel(s: string): string {
        const map: Record<string, string> = { LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' };
        return map[s] ?? s;
    }

    getSeverityTag(s: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            LOW: 'info',
            MEDIUM: 'warn',
            HIGH: 'danger',
            CRITICAL: 'contrast'
        };
        return map[s] ?? 'secondary';
    }

    getInstallmentSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            PAID: 'success',
            PENDING: 'info',
            OVERDUE: 'danger',
            PARTIAL: 'warn'
        };
        return map[status] ?? 'secondary';
    }

    getInstallmentLabel(status: string): string {
        const map: Record<string, string> = {
            PAID: 'Pagado',
            PENDING: 'Pendiente',
            OVERDUE: 'Vencido',
            PARTIAL: 'Parcial'
        };
        return map[status] ?? status;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDateTime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
