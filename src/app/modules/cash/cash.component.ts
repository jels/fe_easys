// src/app/modules/cash/cash.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CashService } from '../../core/services/api/cash.service';
import { AuthService } from '../../core/services/api/auth.service';
import { CashConceptResponse, CashMovementResponse, CashStatsResponse, CashDailySummaryResponse, CreateCashMovementRequest, UpdateCashMovementRequest, CashMovementType } from '../../core/models/cash.models';

@Component({
    selector: 'app-cash',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        SkeletonModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
        TooltipModule,
        ToggleSwitchModule,
        ConfirmDialogModule
    ],
    templateUrl: './cash.component.html',
    styleUrl: './cash.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class CashComponent implements OnInit, OnDestroy {
    // ── Datos ─────────────────────────────────────────────────────────────────
    movements = signal<CashMovementResponse[]>([]);
    concepts = signal<CashConceptResponse[]>([]);
    stats = signal<CashStatsResponse | null>(null);
    dailySummary = signal<CashDailySummaryResponse | null>(null);

    // ── Loading ───────────────────────────────────────────────────────────────
    loadingMovements = signal(false);
    loadingStats = signal(false);
    savingMovement = signal(false);

    // ── Filtros ───────────────────────────────────────────────────────────────
    filterDate: Date = new Date(); // predeterminado: hoy
    filterDateTo: Date | null = null; // null = mismo día
    filterType: string | null = null;
    filterConcept: number | null = null;
    showDateRange = false;

    // ── Modal registro ────────────────────────────────────────────────────────
    showForm = signal(false);
    isEditMode = signal(false);
    editingId = signal<number | null>(null);
    movementForm!: FormGroup;
    conceptsFiltered = signal<CashConceptResponse[]>([]);

    // ── Modal detalle ─────────────────────────────────────────────────────────
    showDetail = false;
    selectedMovement = signal<CashMovementResponse | null>(null);

    readonly typeOptions = [
        { label: 'Todos', value: null },
        { label: 'Ingresos', value: 'INCOME' },
        { label: 'Egresos', value: 'EXPENSE' }
    ];

    readonly paymentMethodOptions = [
        { label: 'Efectivo', value: 'CASH' },
        { label: 'Transferencia', value: 'TRANSFER' },
        { label: 'Tarjeta', value: 'CARD' },
        { label: 'Cheque', value: 'CHECK' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private cashService: CashService,
        private authService: AuthService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private get idCompany(): number | null {
        return this.authService.idCompany;
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadAll(): void {
        this.loadStats();
        this.loadMovements();
        this.loadConcepts();
    }

    loadStats(): void {
        const id = this.idCompany;
        if (!id) return;
        this.loadingStats.set(true);
        this.cashService
            .getStats(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                    this.loadingStats.set(false);
                },
                error: () => this.loadingStats.set(false)
            });

        // Resumen del día seleccionado
        this.cashService
            .getDailySummary(id, this.toIsoDate(this.filterDate))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.dailySummary.set(res.data ?? null);
                }
            });
    }

    loadMovements(): void {
        const id = this.idCompany;
        if (!id) return;
        this.loadingMovements.set(true);

        const dateFrom = this.toIsoDate(this.filterDate);
        const dateTo = this.showDateRange && this.filterDateTo ? this.toIsoDate(this.filterDateTo) : dateFrom;

        this.cashService
            .getMovements(id, {
                dateFrom,
                dateTo,
                movementType: this.filterType ?? undefined,
                idCashConcept: this.filterConcept ?? undefined
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.movements.set(res.success ? (res.data ?? []) : []);
                    this.loadingMovements.set(false);
                },
                error: () => this.loadingMovements.set(false)
            });
    }

    loadConcepts(): void {
        const id = this.idCompany;
        if (!id) return;
        this.cashService
            .getConcepts(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.concepts.set(res.data ?? []);
                }
            });
    }

    // ── Filtros ───────────────────────────────────────────────────────────────

    onDateChange(): void {
        this.loadMovements();
        this.loadStats();
    }

    goToday(): void {
        this.filterDate = new Date();
        this.filterDateTo = null;
        this.loadMovements();
        this.loadStats();
    }

    prevDay(): void {
        const d = new Date(this.filterDate);
        d.setDate(d.getDate() - 1);
        this.filterDate = d;
        this.onDateChange();
    }

    nextDay(): void {
        const d = new Date(this.filterDate);
        d.setDate(d.getDate() + 1);
        this.filterDate = d;
        this.onDateChange();
    }

    onTypeFilter(): void {
        this.loadMovements();
    }
    onConceptFilter(): void {
        this.loadMovements();
    }

    clearFilters(): void {
        this.filterType = null;
        this.filterConcept = null;
        this.loadMovements();
    }

    get hasFilters(): boolean {
        return !!(this.filterType || this.filterConcept);
    }

    // ── Formulario ────────────────────────────────────────────────────────────

    private buildForm(): void {
        this.movementForm = this.fb.group({
            movementType: ['INCOME', Validators.required],
            idCashConcept: [null, Validators.required],
            movementDate: [new Date(), Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            beneficiaryName: [''],
            paymentMethod: ['CASH', Validators.required],
            referenceNumber: [''],
            description: [''],
            notes: ['']
        });

        // Al cambiar tipo → filtrar conceptos
        this.movementForm
            .get('movementType')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((type) => this.filterConceptsByType(type));
    }

    private filterConceptsByType(type: string): void {
        const all = this.concepts();
        if (!type) {
            this.conceptsFiltered.set(all);
            return;
        }
        this.conceptsFiltered.set(all.filter((c) => c.movementType === type || c.movementType === 'BOTH'));
        // Limpiar concepto si ya no aplica
        const currentId = this.movementForm.get('idCashConcept')?.value;
        if (currentId && !this.conceptsFiltered().find((c) => c.idCashConcept === currentId)) {
            this.movementForm.patchValue({ idCashConcept: null });
        }
    }

    openCreate(type?: CashMovementType): void {
        this.isEditMode.set(false);
        this.editingId.set(null);
        this.movementForm.reset({
            movementType: type ?? 'INCOME',
            movementDate: new Date(),
            paymentMethod: 'CASH'
        });
        this.filterConceptsByType(type ?? 'INCOME');
        this.showForm.set(true);
    }

    openEdit(m: CashMovementResponse): void {
        this.isEditMode.set(true);
        this.editingId.set(m.idCashMovement);
        this.filterConceptsByType(m.movementType);
        this.movementForm.patchValue({
            movementType: m.movementType,
            idCashConcept: m.idCashConcept,
            movementDate: new Date(m.movementDate),
            amount: m.amount,
            beneficiaryName: m.beneficiaryName ?? '',
            paymentMethod: m.paymentMethod ?? 'CASH',
            referenceNumber: m.referenceNumber ?? '',
            description: m.description ?? '',
            notes: m.notes ?? ''
        });
        this.showForm.set(true);
    }

    openDetail(m: CashMovementResponse): void {
        this.selectedMovement.set(m);
        this.showDetail = true;
    }

    submitForm(): void {
        if (this.movementForm.invalid) {
            this.movementForm.markAllAsTouched();
            return;
        }
        const id = this.idCompany;
        if (!id) return;
        this.savingMovement.set(true);

        const v = this.movementForm.value;

        if (this.isEditMode()) {
            const req: UpdateCashMovementRequest = {
                idCashConcept: v.idCashConcept,
                movementType: v.movementType,
                movementDate: this.toIsoDate(v.movementDate),
                amount: v.amount,
                beneficiaryName: v.beneficiaryName || undefined,
                paymentMethod: v.paymentMethod,
                referenceNumber: v.referenceNumber || undefined,
                description: v.description || undefined,
                notes: v.notes || undefined
            };
            this.cashService
                .update(this.editingId()!, req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.savingMovement.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.loadAll();
                            this.messageService.add({ severity: 'success', summary: 'Movimiento actualizado' });
                        }
                    },
                    error: () => this.savingMovement.set(false)
                });
        } else {
            const req: CreateCashMovementRequest = {
                idCompany: id,
                idCashConcept: v.idCashConcept,
                movementType: v.movementType,
                movementDate: this.toIsoDate(v.movementDate),
                amount: v.amount,
                beneficiaryName: v.beneficiaryName || undefined,
                paymentMethod: v.paymentMethod,
                referenceNumber: v.referenceNumber || undefined,
                description: v.description || undefined,
                notes: v.notes || undefined
            };
            this.cashService
                .create(req)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.savingMovement.set(false);
                        if (res.success) {
                            this.showForm.set(false);
                            this.loadAll();
                            this.messageService.add({
                                severity: 'success',
                                summary: `${v.movementType === 'INCOME' ? 'Ingreso' : 'Egreso'} registrado`,
                                detail: this.formatCurrency(v.amount)
                            });
                        }
                    },
                    error: () => this.savingMovement.set(false)
                });
        }
    }

    confirmCancel(m: CashMovementResponse): void {
        this.confirmationService.confirm({
            message: `¿Anular el movimiento de <strong>${this.formatCurrency(m.amount)}</strong>?`,
            header: 'Confirmar anulación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.cashService
                    .cancel(m.idCashMovement)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.loadAll();
                            this.messageService.add({ severity: 'warn', summary: 'Movimiento anulado' });
                        }
                    });
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    isFieldInvalid(field: string): boolean {
        const c = this.movementForm.get(field);
        return !!(c?.invalid && c.touched);
    }

    formatCurrency(n: number | null | undefined): string {
        if (n == null) return '–';
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(n);
    }

    getTypeSeverity(type: string): 'success' | 'danger' {
        return type === 'INCOME' ? 'success' : 'danger';
    }

    getTypeLabel(type: string): string {
        return type === 'INCOME' ? 'Ingreso' : 'Egreso';
    }

    getMethodLabel(m: string): string {
        return ({ CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta', CHECK: 'Cheque' } as Record<string, string>)[m] ?? m;
    }

    getCategoryLabel(cat: string): string {
        return (
            (
                {
                    TUITION_PAYMENT: 'Mensualidad',
                    ENROLLMENT_PAYMENT: 'Matrícula',
                    SUPPLIER_PAYMENT: 'Proveedor',
                    SALARY: 'Sueldo',
                    OPERATIONAL_EXPENSE: 'Gasto Operativo',
                    OTHER_INCOME: 'Otro Ingreso',
                    OTHER_EXPENSE: 'Otro Egreso'
                } as Record<string, string>
            )[cat] ?? cat
        );
    }

    get isToday(): boolean {
        const today = new Date();
        return this.filterDate.toDateString() === today.toDateString();
    }

    get totalIncome(): number {
        return this.movements()
            .filter((m) => m.movementType === 'INCOME' && m.isActive)
            .reduce((s, m) => s + m.amount, 0);
    }

    get totalExpense(): number {
        return this.movements()
            .filter((m) => m.movementType === 'EXPENSE' && m.isActive)
            .reduce((s, m) => s + m.amount, 0);
    }

    get balance(): number {
        return this.totalIncome - this.totalExpense;
    }

    get conceptOptions(): { label: string; value: number }[] {
        return [{ label: 'Todos los conceptos', value: 0 }, ...this.concepts().map((c) => ({ label: c.name, value: c.idCashConcept }))];
    }

    private toIsoDate(d: Date | string): string {
        if (!d) return new Date().toISOString().split('T')[0];
        if (typeof d === 'string') return d;
        return d.toISOString().split('T')[0];
    }
}
