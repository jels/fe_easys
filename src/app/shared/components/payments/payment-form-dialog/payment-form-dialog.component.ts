// src/app/shared/components/payments/payment-form-dialog/payment-form-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

import { PaymentsService, NewPaymentRequest } from '../../../../core/services/conf/payments.service';
import { StudentMock } from '../../../../shared/data/people.mock';
import { PaymentInstallmentMock, PaymentMethodMock, MOCK_PAYMENT_PLANS } from '../../../../shared/data/payments.mock';

@Component({
    selector: 'app-payment-form-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule, InputNumberModule, TextareaModule, DividerModule, SkeletonModule],
    templateUrl: './payment-form-dialog.component.html',
    styleUrl: './payment-form-dialog.component.scss'
})
export class PaymentFormDialogComponent implements OnChanges, OnInit {
    @Input() students: StudentMock[] = [];
    @Input() preselectedInstallment: PaymentInstallmentMock | null = null;
    @Input() visible = false;

    @Output() onSave = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    payMethods = signal<PaymentMethodMock[]>([]);
    installments = signal<PaymentInstallmentMock[]>([]);
    loadingInst = signal(false);

    constructor(
        private fb: FormBuilder,
        private paymentsService: PaymentsService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        this.paymentsService.getPaymentMethods().subscribe((m) => this.payMethods.set(m));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true) {
            this.form.reset();
            this.installments.set([]);
            this.form.patchValue({
                paymentDate: new Date().toISOString().split('T')[0],
                idPaymentMethod: 1
            });

            // Cuota preseleccionada (desde botón "Cobrar" en tabla)
            if (this.preselectedInstallment) {
                const inst = this.preselectedInstallment;
                const plan = MOCK_PAYMENT_PLANS.find((p) => p.idStudentPaymentPlan === inst.idStudentPaymentPlan);
                if (plan) {
                    this.form.patchValue({ idStudent: plan.idStudent });
                    this.loadInstallmentsForStudent(plan.idStudent);
                }
                this.form.patchValue({
                    idPaymentInstallment: inst.idPaymentInstallment,
                    amount: inst.balance
                });
            }
        }
    }

    private buildForm(): void {
        this.form = this.fb.group({
            idStudent: [null, Validators.required],
            idPaymentInstallment: [null],
            idPaymentMethod: [1, Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
            referenceNumber: [''],
            notes: ['']
        });

        // Al cambiar alumno → cargar sus cuotas pendientes
        this.form.get('idStudent')?.valueChanges.subscribe((id) => {
            if (id) this.loadInstallmentsForStudent(id);
            else this.installments.set([]);
            this.form.patchValue({ idPaymentInstallment: null }, { emitEvent: false });
        });

        // Al seleccionar cuota → auto-rellenar monto con el saldo
        this.form.get('idPaymentInstallment')?.valueChanges.subscribe((id) => {
            if (!id) return;
            const inst = this.installments().find((i) => i.idPaymentInstallment === id);
            if (inst) {
                this.form.patchValue({ amount: inst.balance }, { emitEvent: false });
            }
        });
    }

    private loadInstallmentsForStudent(idStudent: number): void {
        this.loadingInst.set(true);
        this.paymentsService.getInstallments({ idStudent, status: 'PENDING' }).subscribe((list) => {
            this.installments.set(list);
            this.loadingInst.set(false);
        });
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.loading.set(true);

        const v = this.form.value;
        const req: NewPaymentRequest = {
            idStudent: v.idStudent,
            idPaymentInstallment: v.idPaymentInstallment || undefined,
            idPaymentMethod: v.idPaymentMethod,
            amount: v.amount,
            paymentDate: v.paymentDate,
            referenceNumber: v.referenceNumber || undefined,
            notes: v.notes || undefined
        };

        this.paymentsService.registerPayment(req).subscribe({
            next: () => {
                this.loading.set(false);
                this.onSave.emit();
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

    get studentOptions(): { label: string; value: number }[] {
        return this.students.map((s) => ({
            label: `${s.fullName} — ${s.gradeName} ${s.sectionName}`,
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
        const method = this.payMethods().find((m) => m.idPaymentMethod === methodId);
        return method?.requiresReference ?? false;
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(n);
    }
}
