// src/app/shared/components/student/student-detail-dialog/student-detail-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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

// Services
import { StudentsService } from '../../../../core/services/conf/students.service';
import { OperationsService } from '../../../../core/services/conf/operations.service';
import { PaymentsService } from '../../../../core/services/conf/payments.service';

// Types
import { StudentMock, StudentParentMock } from '../../../../shared/data/people.mock';
import { StudentAccessLogMock, StudentInfractionMock, GradeScoreMock } from '../../../../shared/data/operations.mock';
import { PaymentInstallmentMock } from '../../../../shared/data/payments.mock';

@Component({
    selector: 'app-student-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TableModule, ConfirmDialogModule, TooltipModule, DividerModule],
    templateUrl: './student-detail-dialog.component.html',
    styleUrl: './student-detail-dialog.component.scss'
})
export class StudentDetailDialogComponent implements OnChanges {
    @Input() studentId: number | null = null;
    @Input() visible = false;

    @Output() onEdit = new EventEmitter<StudentMock>();
    @Output() onClose = new EventEmitter<void>();

    student = signal<StudentMock | null>(null);
    parents = signal<StudentParentMock[]>([]);
    accessLogs = signal<StudentAccessLogMock[]>([]);
    infractions = signal<StudentInfractionMock[]>([]);
    scores = signal<GradeScoreMock[]>([]);
    installments = signal<PaymentInstallmentMock[]>([]);

    loading = signal(false);
    loadingParents = signal(false);

    constructor(
        private studentsService: StudentsService,
        private operationsService: OperationsService,
        private paymentsService: PaymentsService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.studentId) {
            this.loadAll(this.studentId);
        }
        if (changes['visible']?.currentValue === false) {
            this.clearData();
        }
    }

    private loadAll(id: number): void {
        this.loading.set(true);

        // Student + parents
        this.studentsService.getById(id).subscribe((student) => {
            this.student.set(student ?? null);
            this.loading.set(false);
        });

        this.studentsService.getParentsByStudent(id).subscribe((p) => this.parents.set(p));

        // Access logs
        this.operationsService.getStudentAccessLogs(undefined, id).subscribe((logs) => this.accessLogs.set(logs));

        // Infractions
        this.operationsService.getInfractions(id).subscribe((inf) => this.infractions.set(inf));

        // Scores (by enrollment id = student id for demo)
        this.operationsService.getScoresByStudent(id).subscribe((s) => this.scores.set(s));

        // Installments
        this.paymentsService.getInstallments({ idStudent: id }).subscribe((i) => this.installments.set(i));
    }

    private clearData(): void {
        this.student.set(null);
        this.parents.set([]);
        this.accessLogs.set([]);
        this.infractions.set([]);
        this.scores.set([]);
        this.installments.set([]);
    }

    editStudent(): void {
        if (this.student()) this.onEdit.emit(this.student()!);
    }

    close(): void {
        this.onClose.emit();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get fullName(): string {
        const s = this.student();
        return s ? `${s.person.firstName} ${s.person.lastName}` : '';
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
        const map: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', GRADUATED: 'Egresado', TRANSFERRED: 'Transferido', WITHDRAWN: 'Retirado' };
        return map[status] ?? status;
    }

    getRelationshipLabel(rel: string): string {
        const map: Record<string, string> = { FATHER: 'Padre', MOTHER: 'Madre', LEGAL_GUARDIAN: 'Tutor Legal', GRANDPARENT: 'Abuelo/a', UNCLE_AUNT: 'Tío/a', SIBLING: 'Hermano/a', OTHER: 'Otro' };
        return map[rel] ?? rel;
    }

    getSeverityLabel(s: string): string {
        const map: Record<string, string> = { LOW: 'Leve', MEDIUM: 'Moderada', HIGH: 'Grave', CRITICAL: 'Crítica' };
        return map[s] ?? s;
    }

    getSeverityTag(s: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = { LOW: 'info', MEDIUM: 'warn', HIGH: 'danger', CRITICAL: 'contrast' };
        return map[s] ?? 'secondary';
    }

    getInstallmentSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = { PAID: 'success', PENDING: 'info', OVERDUE: 'danger', PARTIAL: 'warn' };
        return map[status] ?? 'secondary';
    }

    getInstallmentLabel(status: string): string {
        const map: Record<string, string> = { PAID: 'Pagado', PENDING: 'Pendiente', OVERDUE: 'Vencido', PARTIAL: 'Parcial' };
        return map[status] ?? status;
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(amount);
    }

    formatDateTime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}
