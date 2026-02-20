// src/app/shared/components/payments/payment-detail-dialog/payment-detail-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

import { PaymentsService } from '../../../../core/services/conf/payments.service';
import { PaymentMock } from '../../../../shared/data/payments.mock';

@Component({
    selector: 'app-payment-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, DividerModule, SkeletonModule],
    templateUrl: './payment-detail-dialog.component.html',
    styleUrl: './payment-detail-dialog.component.scss'
})
export class PaymentDetailDialogComponent implements OnChanges {
    @Input() paymentId: number | null = null;
    @Input() visible = false;
    @Output() onClose = new EventEmitter<void>();

    payment = signal<PaymentMock | null>(null);
    loading = signal(false);

    constructor(private paymentsService: PaymentsService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.paymentId) {
            this.loading.set(true);
            this.paymentsService.getPaymentById(this.paymentId).subscribe((p) => {
                this.payment.set(p ?? null);
                this.loading.set(false);
            });
        }
        if (changes['visible']?.currentValue === false) {
            this.payment.set(null);
        }
    }

    close(): void {
        this.onClose.emit();
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n);
    }

    getMethodIcon(method: string): string {
        const map: Record<string, string> = { CASH: 'pi-wallet', TRANSFER: 'pi-arrow-right-arrow-left', CARD: 'pi-credit-card', CHECK: 'pi-file' };
        return `pi ${map[method] ?? 'pi-dollar'}`;
    }
}
