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

import { PaymentsService, PaymentFilter, InstallmentFilter } from '../../core/services/conf/payments.service';
import { PaymentMock, PaymentInstallmentMock, PaymentConceptMock, MOCK_PAYMENT_PLANS } from '../../shared/data/payments.mock';
import { MOCK_STUDENTS } from '../../shared/data/people.mock';

import { PaymentFormDialogComponent } from '../../shared/components/payments/payment-form-dialog/payment-form-dialog.component';
import { PaymentDetailDialogComponent } from '../../shared/components/payments/payment-detail-dialog/payment-detail-dialog.component';

interface FinancialStats {
    totalCollectedMonth: number;
    totalCollectedYear: number;
    pendingAmount: number;
    overdueAmount: number;
    paymentsThisMonth: number;
    overdueCount: number;
    pendingCount: number;
}

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
    stats = signal<FinancialStats | null>(null);

    // Tab 1 – Recibos
    payments = signal<PaymentMock[]>([]);
    loadingPay = signal(false);
    searchPay = '';
    filterActive: boolean | null = null;

    // Tab 2 – Cuotas
    installments = signal<PaymentInstallmentMock[]>([]);
    loadingInst = signal(false);
    instFilter: 'PENDING' | 'OVERDUE' | 'ALL' = 'ALL';

    // Tab 3 – Vencidas
    overdue = signal<PaymentInstallmentMock[]>([]);
    loadingOver = signal(false);

    // Tab 4 – Conceptos
    concepts = signal<PaymentConceptMock[]>([]);
    loadingConcepts = signal(false);

    // Modales
    showFormDialog = signal(false);
    showDetailDialog = signal(false);
    selectedPaymentId = signal<number | null>(null);
    preselectedInstallment = signal<PaymentInstallmentMock | null>(null);

    activeOptions = [
        { label: 'Todos', value: null },
        { label: 'Activos', value: true },
        { label: 'Anulados', value: false }
    ];

    readonly students = MOCK_STUDENTS.filter((s) => s.isActive);

    private destroy$ = new Subject<void>();

    constructor(
        private paymentsService: PaymentsService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadAll();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadAll(): void {
        this.loadStats();
        this.loadPayments();
        this.loadInstallments();
        this.loadOverdue();
        this.loadConcepts();
    }

    loadStats(): void {
        this.paymentsService
            .getFinancialStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    loadPayments(): void {
        this.loadingPay.set(true);
        const f: PaymentFilter = {};
        if (this.searchPay) f.search = this.searchPay;
        if (this.filterActive !== null) f.isActive = this.filterActive;

        this.paymentsService
            .getAllPayments(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.payments.set(data);
                this.loadingPay.set(false);
            });
    }

    loadInstallments(): void {
        this.loadingInst.set(true);
        const f: InstallmentFilter = this.instFilter === 'OVERDUE' ? { overdue: true } : this.instFilter === 'PENDING' ? { status: 'PENDING' } : {};

        this.paymentsService
            .getInstallments(f)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.installments.set(data);
                this.loadingInst.set(false);
            });
    }

    loadOverdue(): void {
        this.loadingOver.set(true);
        this.paymentsService
            .getOverdueInstallments()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.overdue.set(data);
                this.loadingOver.set(false);
            });
    }

    loadConcepts(): void {
        this.loadingConcepts.set(true);
        this.paymentsService
            .getConcepts()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.concepts.set(data);
                this.loadingConcepts.set(false);
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

    openNewPayment(installment?: PaymentInstallmentMock): void {
        this.preselectedInstallment.set(installment ?? null);
        this.selectedPaymentId.set(null);
        this.showFormDialog.set(true);
    }

    openDetail(payment: PaymentMock): void {
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
        const map: Record<string, string> = {
            PAID: 'Pagado',
            PENDING: 'Pendiente',
            OVERDUE: 'Vencido',
            PARTIAL: 'Parcial'
        };
        return map[s] ?? s;
    }

    getInstStatusSeverity(s: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            PAID: 'success',
            PENDING: 'info',
            OVERDUE: 'danger',
            PARTIAL: 'warn'
        };
        return map[s] ?? 'secondary';
    }

    getConceptTypeLabel(cat: string): string {
        const map: Record<string, string> = {
            TUITION: 'Mensualidad',
            ENROLLMENT: 'Matrícula',
            MATERIAL: 'Material',
            UNIFORM: 'Uniforme',
            OTHER: 'Otro'
        };
        return map[cat] ?? cat;
    }

    getConceptTypeSeverity(cat: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            TUITION: 'info',
            ENROLLMENT: 'success',
            MATERIAL: 'warn',
            UNIFORM: 'contrast',
            OTHER: 'secondary'
        };
        return map[cat] ?? 'secondary';
    }

    isOverdue(dueDate: string): boolean {
        return dueDate < new Date().toISOString().split('T')[0];
    }

    getDaysOverdue(dueDate: string): number {
        const diff = new Date().getTime() - new Date(dueDate).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Obtener nombre del alumno de una cuota via payment plan
    getStudentForInstallment(inst: PaymentInstallmentMock): string {
        return inst.studentName ?? '–';
    }

    getConceptForInstallment(inst: PaymentInstallmentMock): string {
        return inst.conceptName ?? '–';
    }

    get hasActiveFilters(): boolean {
        return !!(this.searchPay || this.filterActive !== null);
    }
}
