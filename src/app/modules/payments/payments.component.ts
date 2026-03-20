// src/app/modules/payments/payments.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { PaymentsService } from '../../core/services/api/payments.service';
import { StudentsService } from '../../core/services/api/students.service';
import { AuthService } from '../../core/services/api/auth.service';

// Models

// Dialogs
import { PaymentFormDialogComponent } from '../../shared/components/payments/payment-form-dialog/payment-form-dialog.component';
import { PaymentDetailDialogComponent } from '../../shared/components/payments/payment-detail-dialog/payment-detail-dialog.component';
import { PaymentConceptResponse, PaymentInstallmentResponse, PaymentResponse, PaymentStatsResponse } from '../../core/models/operations.models';
import { StudentResponse } from '../../core/models/student.dto';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, DatePickerModule, SelectModule, TagModule, TabsModule, TableModule, SkeletonModule, ButtonModule, TooltipModule, ToastModule, PaymentFormDialogComponent, PaymentDetailDialogComponent],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss',
    providers: [MessageService]
})
export class PaymentsComponent implements OnInit, OnDestroy {
    activeTab = signal('0');
    stats = signal<PaymentStatsResponse | null>(null);

    // Tab 1 – Recibos
    payments = signal<PaymentResponse[]>([]);
    loadingPay = signal(false);
    totalPayments = signal(0);
    searchPay = '';
    filterActive: boolean | null = null;

    // Tab 2 – Cuotas
    installments = signal<PaymentInstallmentResponse[]>([]);
    loadingInst = signal(false);
    instFilter: 'PENDING' | 'OVERDUE' | 'ALL' = 'ALL';

    // Tab 3 – Vencidas
    overdue = signal<PaymentInstallmentResponse[]>([]);
    loadingOver = signal(false);

    // Tab 4 – Conceptos
    concepts = signal<PaymentConceptResponse[]>([]);
    loadingConcepts = signal(false);

    // Alumnos para los dialogs
    students = signal<StudentResponse[]>([]);

    // Modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedPaymentId = signal<number | null>(null);
    preselectedInstallment = signal<PaymentInstallmentResponse | null>(null);

    readonly activeOptions = [
        { label: 'Todos', value: null },
        { label: 'Activos', value: true },
        { label: 'Anulados', value: false }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private paymentsService: PaymentsService,
        private studentsService: StudentsService,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadStudents();
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    private get idCompany(): number | null {
        return this.authService.idCompany;
    }

    private loadStudents(): void {
        if (!this.idCompany) return;
        this.studentsService
            .getAll(this.idCompany, { size: 500 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.students.set(res.data?.content ?? []);
                }
            });
    }

    loadAll(): void {
        this.loadStats();
        this.loadPayments();
        this.loadInstallments();
        this.loadOverdue();
        this.loadConcepts();
    }

    loadStats(): void {
        if (!this.idCompany) return;
        this.paymentsService
            .getStats(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                }
            });
    }

    loadPayments(): void {
        if (!this.idCompany) return;
        this.loadingPay.set(true);

        this.paymentsService
            .getPayments(this.idCompany, {
                search: this.searchPay || undefined,
                size: 50
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    let data = res.success ? (res.data?.content ?? []) : [];
                    // filtro isActive client-side (el backend puede no soportarlo)
                    if (this.filterActive !== null) {
                        data = data.filter((p) => p.isActive === this.filterActive);
                    }
                    this.payments.set(data);
                    this.totalPayments.set(res.data?.totalElements ?? data.length);
                    this.loadingPay.set(false);
                },
                error: () => this.loadingPay.set(false)
            });
    }

    loadInstallments(): void {
        if (!this.idCompany) return;
        this.loadingInst.set(true);

        const req$ =
            this.instFilter === 'OVERDUE'
                ? this.paymentsService.getOverdueInstallments(this.idCompany)
                : this.instFilter === 'PENDING'
                  ? this.paymentsService.getPendingInstallments(this.idCompany)
                  : this.paymentsService.getPendingInstallments(this.idCompany); // ALL: pendientes como default

        req$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
                this.installments.set(res.success ? (res.data ?? []) : []);
                this.loadingInst.set(false);
            },
            error: () => this.loadingInst.set(false)
        });
    }

    loadOverdue(): void {
        if (!this.idCompany) return;
        this.loadingOver.set(true);
        this.paymentsService
            .getOverdueInstallments(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.overdue.set(res.success ? (res.data ?? []) : []);
                    this.loadingOver.set(false);
                },
                error: () => this.loadingOver.set(false)
            });
    }

    loadConcepts(): void {
        if (!this.idCompany) return;
        this.loadingConcepts.set(true);
        this.paymentsService
            .getConcepts(this.idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.concepts.set(res.success ? (res.data ?? []) : []);
                    this.loadingConcepts.set(false);
                },
                error: () => this.loadingConcepts.set(false)
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onSearchPay(): void {
        this.loadPayments();
    }
    onFilterChange(): void {
        this.loadPayments();
    }
    onInstFilterChange(): void {
        this.loadInstallments();
    }

    clearFilters(): void {
        this.searchPay = '';
        this.filterActive = null;
        this.loadPayments();
    }

    // ── Modales ───────────────────────────────────────────────────────────────

    openNewPayment(installment?: PaymentInstallmentResponse): void {
        this.preselectedInstallment.set(installment ?? null);
        this.selectedPaymentId.set(null);
        this.showFormDialog.set(true);
    }

    openDetail(payment: PaymentResponse): void {
        this.selectedPaymentId.set(payment.idPayment);
        this.showDetailDialog.set(true);
    }

    onPaymentSaved(): void {
        this.showFormDialog.set(false);
        this.loadAll();
        this.messageService.add({
            severity: 'success',
            summary: 'Pago registrado',
            detail: 'El recibo fue generado correctamente'
        });
    }

    onDialogClosed(): void {
        this.showFormDialog.set(false);
        this.showDetailDialog.set(false);
    }

    exportToExcel(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Exportar',
            detail: 'En producción se exportará el reporte en Excel'
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(n);
    }

    getMethodIcon(methodName: string): string {
        if (!methodName) return 'pi pi-dollar';
        const n = methodName.toLowerCase();
        if (n.includes('efectivo')) return 'pi pi-wallet';
        if (n.includes('transferencia')) return 'pi pi-arrow-right-arrow-left';
        if (n.includes('tarjeta')) return 'pi pi-credit-card';
        if (n.includes('cheque')) return 'pi pi-file';
        return 'pi pi-dollar';
    }

    getInstStatusLabel(s: string): string {
        return ({ PAID: 'Pagado', PENDING: 'Pendiente', OVERDUE: 'Vencido', PARTIAL: 'Parcial' } as Record<string, string>)[s] ?? s;
    }

    getInstStatusSeverity(s: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        return (
            (
                {
                    PAID: 'success',
                    PENDING: 'info',
                    OVERDUE: 'danger',
                    PARTIAL: 'warn'
                } as Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'>
            )[s] ?? 'secondary'
        );
    }

    getConceptTypeLabel(cat: string): string {
        return (
            (
                {
                    TUITION: 'Mensualidad',
                    ENROLLMENT: 'Matrícula',
                    MATERIAL: 'Material',
                    UNIFORM: 'Uniforme',
                    OTHER: 'Otro'
                } as Record<string, string>
            )[cat] ?? cat
        );
    }

    getConceptTypeSeverity(cat: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        return (
            (
                {
                    TUITION: 'info',
                    ENROLLMENT: 'success',
                    MATERIAL: 'warn',
                    UNIFORM: 'contrast',
                    OTHER: 'secondary'
                } as Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'>
            )[cat] ?? 'secondary'
        );
    }

    isOverdue(dueDate: string): boolean {
        return dueDate < new Date().toISOString().split('T')[0];
    }

    getDaysOverdue(dueDate: string): number {
        const diff = new Date().getTime() - new Date(dueDate).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // PaymentInstallmentResponse ya trae studentName y conceptName directamente
    getStudentForInstallment(inst: PaymentInstallmentResponse): string {
        return inst.studentName ?? '–';
    }

    getConceptForInstallment(inst: PaymentInstallmentResponse): string {
        return inst.conceptName ?? '–';
    }

    get hasActiveFilters(): boolean {
        return !!(this.searchPay || this.filterActive !== null);
    }
}
