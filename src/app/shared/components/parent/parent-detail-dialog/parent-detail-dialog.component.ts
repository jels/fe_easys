// src/app/shared/components/parent/parent-detail-dialog/parent-detail-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

// Services
import { ParentsService } from '../../../../core/services/api/parents.service';
import { PaymentsService } from '../../../../core/services/api/payments.service';
import { AccessControlService } from '../../../../core/services/api/access-control.service';
import { AuthService } from '../../../../core/services/api/auth.service';

// Models
import { EarlyDepartureResponse, PaymentResponse } from '../../../../core/models/operations.models';
import { ParentResponse, StudentParentResponse } from '../../../../core/models/student.dto';

@Component({
    selector: 'app-parent-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TableModule, TooltipModule, DividerModule],
    templateUrl: './parent-detail-dialog.component.html',
    styleUrl: './parent-detail-dialog.component.scss'
})
export class ParentDetailDialogComponent implements OnChanges, OnDestroy {
    activeTab = signal('0');

    @Input() parentId: number | null = null;
    @Input() visible = false;

    @Output() onEdit = new EventEmitter<ParentResponse>();
    @Output() onClose = new EventEmitter<void>();

    parent = signal<ParentResponse | null>(null);
    linkedStudents = signal<StudentParentResponse[]>([]);
    payments = signal<PaymentResponse[]>([]);
    earlyDepartures = signal<EarlyDepartureResponse[]>([]);

    loading = signal(false);
    loadingStudents = signal(false);
    loadingPayments = signal(false);
    loadingDeps = signal(false);

    private destroy$ = new Subject<void>();

    constructor(
        private parentsService: ParentsService,
        private paymentsService: PaymentsService,
        private accessService: AccessControlService,
        private authService: AuthService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.parentId) {
            this.loadAll(this.parentId);
        }
        if (changes['visible']?.currentValue === false) {
            this.clearData();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    private loadAll(id: number): void {
        const idCompany = this.authService.idCompany;
        this.loading.set(true);
        this.loadingStudents.set(true);
        this.loadingPayments.set(true);
        this.loadingDeps.set(true);

        // ── Padre principal ───────────────────────────────────────────────────
        this.parentsService
            .getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.parent.set(res.success ? (res.data ?? null) : null);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });

        // ── Alumnos vinculados ────────────────────────────────────────────────
        // GET /api/v1/parents/{id}/students → StudentParentResponse[]
        this.parentsService
            .getStudentsByParent(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const list = res.success ? (res.data ?? []) : [];
                    this.linkedStudents.set(list);
                    this.loadingStudents.set(false);

                    // Con los ids de alumnos cargamos pagos y retiros
                    const studentIds = list.map((l) => l.idStudent);
                    if (studentIds.length > 0) {
                        this.loadPaymentsForStudents(studentIds);
                        if (idCompany) this.loadDeparturesForStudents(studentIds, idCompany);
                        else {
                            this.loadingDeps.set(false);
                            this.loadingPayments.set(false);
                        }
                    } else {
                        this.loadingPayments.set(false);
                        this.loadingDeps.set(false);
                    }
                },
                error: () => {
                    this.loadingStudents.set(false);
                    this.loadingPayments.set(false);
                    this.loadingDeps.set(false);
                }
            });
    }

    private loadPaymentsForStudents(studentIds: number[]): void {
        // Para cada alumno cargamos sus pagos y los combinamos
        const requests = studentIds.map((id) => this.paymentsService.getPayments(this.authService.idCompany!, { idStudent: id, size: 50 }).pipe(catchError(() => of(null))));

        forkJoin(requests)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
                const allPayments: PaymentResponse[] = results.flatMap((res) => (res?.success ? (res.data?.content ?? []) : []));
                this.payments.set(allPayments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)));
                this.loadingPayments.set(false);
            });
    }

    private loadDeparturesForStudents(studentIds: number[], idCompany: number): void {
        // Cargamos retiros anticipados del día filtrados por cada alumno
        const requests = studentIds.map((id) => this.accessService.getEarlyDepartures(idCompany, { idStudent: id, size: 50 }).pipe(catchError(() => of(null))));

        forkJoin(requests)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
                const allDeps: EarlyDepartureResponse[] = results.flatMap((res) => (res?.success ? (res.data?.content ?? []) : []));
                this.earlyDepartures.set(allDeps.sort((a, b) => b.departureDatetime.localeCompare(a.departureDatetime)));
                this.loadingDeps.set(false);
            });
    }

    private clearData(): void {
        this.parent.set(null);
        this.linkedStudents.set([]);
        this.payments.set([]);
        this.earlyDepartures.set([]);
    }

    // ── Acciones ──────────────────────────────────────────────────────────────

    editParent(): void {
        if (this.parent()) this.onEdit.emit(this.parent()!);
    }

    close(): void {
        this.onClose.emit();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get fullName(): string {
        return this.parent()?.person.fullName ?? '';
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase();
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

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        return (
            (
                {
                    ACTIVE: 'success',
                    INACTIVE: 'danger',
                    GRADUATED: 'info',
                    TRANSFERRED: 'warn',
                    WITHDRAWN: 'secondary'
                } as Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'>
            )[status] ?? 'secondary'
        );
    }

    getStatusLabel(status: string): string {
        return (
            (
                {
                    ACTIVE: 'Activo',
                    INACTIVE: 'Inactivo',
                    GRADUATED: 'Egresado',
                    TRANSFERRED: 'Transferido',
                    WITHDRAWN: 'Retirado'
                } as Record<string, string>
            )[status] ?? status
        );
    }

    getPaymentSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        return (
            (
                {
                    PAID: 'success',
                    PENDING: 'info',
                    OVERDUE: 'danger',
                    PARTIAL: 'warn'
                } as Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'>
            )[status] ?? 'secondary'
        );
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(amount);
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

    get totalPaid(): number {
        return this.payments().reduce((sum, p) => sum + p.amount, 0);
    }
}
