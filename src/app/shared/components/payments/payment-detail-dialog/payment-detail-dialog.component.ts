// src/app/shared/components/payments/payment-detail-dialog/payment-detail-dialog.component.ts

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

import { PaymentsService } from '../../../../core/services/api/payments.service';
import { PaymentResponse } from '../../../../core/models/operations.models';

@Component({
    selector: 'app-payment-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, DividerModule, SkeletonModule],
    templateUrl: './payment-detail-dialog.component.html',
    styleUrl: './payment-detail-dialog.component.scss'
})
export class PaymentDetailDialogComponent implements OnChanges, OnDestroy {
    @Input() paymentId: number | null = null;
    @Input() visible = false;

    @Output() onClose = new EventEmitter<void>();

    payment = signal<PaymentResponse | null>(null);
    loading = signal(false);

    private destroy$ = new Subject<void>();

    constructor(private paymentsService: PaymentsService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.paymentId) {
            this.loading.set(true);
            this.paymentsService
                .getPaymentById(this.paymentId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        this.payment.set(res.success ? (res.data ?? null) : null);
                        this.loading.set(false);
                    },
                    error: () => this.loading.set(false)
                });
        }
        if (changes['visible']?.currentValue === false) {
            this.payment.set(null);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    close(): void {
        this.onClose.emit();
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            maximumFractionDigits: 0
        }).format(n);
    }

    getMethodIcon(method: string): string {
        const map: Record<string, string> = {
            CASH: 'pi-wallet',
            TRANSFER: 'pi-arrow-right-arrow-left',
            CARD: 'pi-credit-card',
            CHECK: 'pi-file'
        };
        return `pi ${map[method] ?? 'pi-dollar'}`;
    }
}
