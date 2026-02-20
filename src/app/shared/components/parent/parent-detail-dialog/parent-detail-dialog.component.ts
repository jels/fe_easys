// src/app/shared/components/parent/parent-detail-dialog/parent-detail-dialog.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

import { ParentsService } from '../../../../core/services/conf/parents.service';
import { PaymentsService } from '../../../../core/services/conf/payments.service';
import { OperationsService } from '../../../../core/services/conf/operations.service';

import { ParentMock, StudentMock, StudentParentMock } from '../../../../shared/data/people.mock';
import { PaymentMock } from '../../../../shared/data/payments.mock';
import { EarlyDepartureMock } from '../../../../shared/data/operations.mock';

interface LinkedStudent {
    relation: StudentParentMock;
    student: StudentMock;
}

@Component({
    selector: 'app-parent-detail-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TableModule, TooltipModule, DividerModule],
    templateUrl: './parent-detail-dialog.component.html',
    styleUrl: './parent-detail-dialog.component.scss'
})
export class ParentDetailDialogComponent implements OnChanges {
    @Input() parentId: number | null = null;
    @Input() visible = false;

    @Output() onEdit = new EventEmitter<ParentMock>();
    @Output() onClose = new EventEmitter<void>();

    parent = signal<ParentMock | null>(null);
    linkedStudents = signal<LinkedStudent[]>([]);
    payments = signal<PaymentMock[]>([]);
    earlyDepartures = signal<EarlyDepartureMock[]>([]);
    loading = signal(false);

    constructor(
        private parentsService: ParentsService,
        private paymentsService: PaymentsService,
        private operationsService: OperationsService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']?.currentValue === true && this.parentId) {
            this.loadAll(this.parentId);
        }
        if (changes['visible']?.currentValue === false) {
            this.clearData();
        }
    }

    private loadAll(id: number): void {
        this.loading.set(true);

        this.parentsService.getById(id).subscribe((p) => {
            this.parent.set(p ?? null);
            this.loading.set(false);
        });

        this.parentsService.getStudentsByParent(id).subscribe((list) => {
            this.linkedStudents.set(list);
        });

        // Pagos de los hijos vinculados (carga todos y filtra por student ids)
        this.parentsService.getStudentsByParent(id).subscribe((list) => {
            const studentIds = list.map((l) => l.student.idStudent);
            this.paymentsService.getAllPayments().subscribe((allPayments) => {
                this.payments.set(allPayments.filter((p) => studentIds.includes(p.idStudent)));
            });
            // Salidas anticipadas de los hijos
            const allDepartures: EarlyDepartureMock[] = [];
            let pending = studentIds.length;
            if (pending === 0) {
                this.earlyDepartures.set([]);
                return;
            }
            studentIds.forEach((sid) => {
                this.operationsService.getEarlyDepartures(sid).subscribe((deps) => {
                    allDepartures.push(...deps);
                    pending--;
                    if (pending === 0) this.earlyDepartures.set(allDepartures.sort((a, b) => b.departureDatetime.localeCompare(a.departureDatetime)));
                });
            });
        });
    }

    private clearData(): void {
        this.parent.set(null);
        this.linkedStudents.set([]);
        this.payments.set([]);
        this.earlyDepartures.set([]);
    }

    editParent(): void {
        if (this.parent()) this.onEdit.emit(this.parent()!);
    }

    close(): void {
        this.onClose.emit();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    get fullName(): string {
        const p = this.parent();
        return p ? `${p.person.firstName} ${p.person.lastName}` : '';
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

    getPaymentSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            PAID: 'success',
            PENDING: 'info',
            OVERDUE: 'danger',
            PARTIAL: 'warn'
        };
        return map[status] ?? 'secondary';
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(amount);
    }

    formatDatetime(dt: string): string {
        return new Date(dt).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    get totalPaid(): number {
        return this.payments().reduce((sum, p) => sum + p.amount, 0);
    }
}
