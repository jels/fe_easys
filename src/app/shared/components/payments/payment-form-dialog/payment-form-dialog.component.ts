// src/app/shared/components/payments/payment-form-dialog/payment-form-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

// Services
import { PaymentsService } from '../../../../core/services/api/payments.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { StudentResponse } from '../../../../core/models/student.dto';
import { PaymentInstallmentResponse, PaymentMethodResponse } from '../../../../core/models/operations.models';

@Component({
    selector: 'app-payment-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, InputNumberModule, TextareaModule, DividerModule, SkeletonModule],
    templateUrl: './payment-form-dialog.component.html',
    styleUrl: './payment-form-dialog.component.scss'
})
export class PaymentFormDialogComponent implements OnChanges, OnInit, OnDestroy {
    @Input() students: StudentResponse[] = [];
    @Input() preselectedInstallment: PaymentInstallmentResponse | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    payMethods = signal<PaymentMethodResponse[]>([]);
    installments = signal<PaymentInstallmentResponse[]>([]);
    loadingInst = signal(false);

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private paymentsService: PaymentsService,
        private authService: AuthService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.paymentsService
            .getMethods(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.payMethods.set(res.data ?? []);
                }
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.installments.set([]);
            this.form.patchValue({
                paymentDate: new Date().toISOString().split('T')[0],
                idPaymentMethod: this.payMethods()[0]?.idPaymentMethod ?? null
            });

            // Cuota preseleccionada (desde botón "Cobrar" en tabla)
            // PaymentInstallmentResponse ya trae idStudent directamente — no necesitamos MOCK_PAYMENT_PLANS
            if (this.preselectedInstallment) {
                const inst = this.preselectedInstallment;
                this.form.patchValue({ idStudent: inst.idStudent });
                this.loadInstallmentsForStudent(inst.idStudent);
                this.form.patchValue({
                    idPaymentInstallment: inst.idPaymentInstallment,
                    amount: inst.balance
                });
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Form ──────────────────────────────────────────────────────────────────

    private buildForm(): void {
        this.form = this.fb.group({
            idStudent: [null, Validators.required],
            idPaymentInstallment: [null],
            idPaymentMethod: [null, Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
            referenceNumber: [''],
            notes: ['']
        });

        // Al cambiar alumno → cargar sus cuotas pendientes
        this.form
            .get('idStudent')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((id) => {
                if (id) this.loadInstallmentsForStudent(id);
                else this.installments.set([]);
                this.form.patchValue({ idPaymentInstallment: null }, { emitEvent: false });
            });

        // Al seleccionar cuota → auto-rellenar monto con el saldo
        this.form
            .get('idPaymentInstallment')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((id) => {
                if (!id) return;
                const inst = this.installments().find((i) => i.idPaymentInstallment === id);
                if (inst) this.form.patchValue({ amount: inst.balance }, { emitEvent: false });
            });
    }

    private loadInstallmentsForStudent(idStudent: number): void {
        this.loadingInst.set(true);
        // GET /api/v1/payments/installments/by-student/{idStudent}
        // Filtramos PENDING client-side para mostrar solo las pendientes
        this.paymentsService
            .getInstallmentsByStudent(idStudent)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const all = res.success ? (res.data ?? []) : [];
                    this.installments.set(all.filter((i) => i.status !== 'PAID'));
                    this.loadingInst.set(false);
                },
                error: () => this.loadingInst.set(false)
            });
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);

        const v = this.form.value;
        const req = {
            idStudent: v.idStudent,
            idPaymentInstallment: v.idPaymentInstallment || undefined,
            idPaymentMethod: v.idPaymentMethod,
            amount: v.amount,
            paymentDate: v.paymentDate,
            referenceNumber: v.referenceNumber || undefined,
            notes: v.notes || undefined
        };

        this.paymentsService
            .registerPayment(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.loading.set(false);
                    if (res.success) this.onSave.emit();
                },
                error: () => this.loading.set(false)
            });
    }

    close(): void {
        this.form.reset();
        this.onClose.emit();
    }

    isFieldInvalid(path: string): boolean {
        const c = this.form.get(path);
        return !!(c?.invalid && c?.touched);
    }

    // ── Options ───────────────────────────────────────────────────────────────

    // StudentResponse: fullName en person.fullName
    get studentOptions(): { label: string; value: number }[] {
        return this.students.map((s) => ({
            label: `${s.person.fullName} — ${s.gradeName ?? ''} ${s.sectionName ?? ''}`.trimEnd(),
            value: s.idStudent
        }));
    }

    get methodOptions(): { label: string; value: number }[] {
        return this.payMethods().map((m) => ({ label: m.name, value: m.idPaymentMethod }));
    }

    get installmentOptions(): { label: string; value: number }[] {
        return this.installments().map((i) => ({
            label: `${i.conceptName ?? 'Cuota'} #${i.installmentNumber} — Vence: ${i.dueDate} — Saldo: ${this.formatCurrency(i.balance)}`,
            value: i.idPaymentInstallment
        }));
    }

    get requiresReference(): boolean {
        const methodId = this.form.get('idPaymentMethod')?.value;
        return this.payMethods().find((m) => m.idPaymentMethod === methodId)?.requiresReference ?? false;
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(n);
    }
}
