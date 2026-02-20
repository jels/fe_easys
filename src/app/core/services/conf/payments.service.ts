// // src/app/core/services/conf/payments.service.ts
// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { delay } from 'rxjs/operators';
// import {
//     MOCK_PAYMENTS,
//     MOCK_PAYMENT_METHODS,
//     MOCK_PAYMENT_CONCEPTS,
//     MOCK_PAYMENT_PLANS,
//     MOCK_INSTALLMENTS,
//     PaymentMock,
//     PaymentMethodMock,
//     PaymentConceptMock,
//     StudentPaymentPlanMock,
//     PaymentInstallmentMock
// } from '../../../shared/data/payments.mock';

// export interface PaymentFilter {
//     search?: string;
//     idStudent?: number;
//     idPaymentMethod?: number;
//     dateFrom?: string;
//     dateTo?: string;
// }

// export interface InstallmentFilter {
//     status?: string;
//     idStudent?: number;
//     idStudentPaymentPlan?: number;
// }

// @Injectable({ providedIn: 'root' })
// export class PaymentsService {
//     readonly DEMO_MODE = true;
//     private readonly DELAY_MS = 400;

//     // ── Payment Methods ───────────────────────────────────────────────────────
//     getAllMethods(): Observable<PaymentMethodMock[]> {
//         return of(MOCK_PAYMENT_METHODS.filter((m) => m.isActive)).pipe(delay(this.DELAY_MS));
//     }

//     // ── Payment Concepts ──────────────────────────────────────────────────────
//     getAllConcepts(): Observable<PaymentConceptMock[]> {
//         return of(MOCK_PAYMENT_CONCEPTS).pipe(delay(this.DELAY_MS));
//     }

//     // ── Payment Plans ─────────────────────────────────────────────────────────
//     getPlansByStudent(idStudent: number): Observable<StudentPaymentPlanMock[]> {
//         return of(MOCK_PAYMENT_PLANS.filter((p) => p.idStudent === idStudent)).pipe(delay(this.DELAY_MS));
//     }

//     // ── Installments ──────────────────────────────────────────────────────────
//     getInstallments(filters?: InstallmentFilter): Observable<PaymentInstallmentMock[]> {
//         let result = [...MOCK_INSTALLMENTS];
//         if (filters?.status) result = result.filter((i) => i.status === filters.status);
//         if (filters?.idStudent) result = result.filter((i) => MOCK_PAYMENT_PLANS.find((p) => p.idStudentPaymentPlan === i.idStudentPaymentPlan)?.idStudent === filters.idStudent);
//         if (filters?.idStudentPaymentPlan) result = result.filter((i) => i.idStudentPaymentPlan === filters.idStudentPaymentPlan);
//         return of(result).pipe(delay(this.DELAY_MS));
//     }

//     getOverdueInstallments(): Observable<PaymentInstallmentMock[]> {
//         return of(MOCK_INSTALLMENTS.filter((i) => i.status === 'OVERDUE')).pipe(delay(this.DELAY_MS));
//     }

//     getPendingInstallments(): Observable<PaymentInstallmentMock[]> {
//         return of(MOCK_INSTALLMENTS.filter((i) => i.status === 'PENDING')).pipe(delay(this.DELAY_MS));
//     }

//     // ── Payments ──────────────────────────────────────────────────────────────
//     getAllPayments(filters?: PaymentFilter): Observable<PaymentMock[]> {
//         let result = [...MOCK_PAYMENTS];
//         if (filters?.search) {
//             const q = filters.search.toLowerCase();
//             result = result.filter((p) => p.studentName?.toLowerCase().includes(q) || p.receiptNumber?.toLowerCase().includes(q) || p.referenceNumber?.toLowerCase().includes(q));
//         }
//         if (filters?.idStudent) result = result.filter((p) => p.idStudent === filters.idStudent);
//         if (filters?.idPaymentMethod) result = result.filter((p) => p.idPaymentMethod === filters.idPaymentMethod);
//         if (filters?.dateFrom) result = result.filter((p) => p.paymentDate >= filters.dateFrom!);
//         if (filters?.dateTo) result = result.filter((p) => p.paymentDate <= filters.dateTo!);
//         return of(result).pipe(delay(this.DELAY_MS));
//     }

//     getPaymentsByStudent(idStudent: number): Observable<PaymentMock[]> {
//         return of(MOCK_PAYMENTS.filter((p) => p.idStudent === idStudent)).pipe(delay(this.DELAY_MS));
//     }

//     // ── Stats ─────────────────────────────────────────────────────────────────
//     getStats(): Observable<{ totalCollected: number; pendingAmount: number; overdueAmount: number; overdueCount: number }> {
//         const totalCollected = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
//         const overdueItems = MOCK_INSTALLMENTS.filter((i) => i.status === 'OVERDUE');
//         const pendingItems = MOCK_INSTALLMENTS.filter((i) => i.status === 'PENDING');
//         const overdueAmount = overdueItems.reduce((sum, i) => sum + i.balance, 0);
//         const pendingAmount = pendingItems.reduce((sum, i) => sum + i.balance, 0);
//         return of({ totalCollected, pendingAmount, overdueAmount, overdueCount: overdueItems.length }).pipe(delay(this.DELAY_MS));
//     }
// }
// src/app/core/services/conf/payments.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_PAYMENTS, MOCK_INSTALLMENTS, MOCK_PAYMENT_CONCEPTS, MOCK_PAYMENT_PLANS, MOCK_PAYMENT_METHODS, PaymentMock, PaymentInstallmentMock, PaymentConceptMock } from '../../../shared/data/payments.mock';
import { MOCK_STUDENTS } from '../../../shared/data/people.mock';

export interface PaymentFilter {
    search?: string;
    isActive?: boolean;
    idStudent?: number;
    dateFrom?: string;
    dateTo?: string;
}

export interface InstallmentFilter {
    status?: string; // PENDING | PAID | OVERDUE | PARTIAL
    idStudent?: number;
    overdue?: boolean;
}

export interface NewPaymentRequest {
    idStudent: number;
    idPaymentInstallment?: number;
    idPaymentMethod: number;
    amount: number;
    paymentDate: string;
    referenceNumber?: string;
    notes?: string;
    idReceivedByStaff?: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 400;

    private _payments = signal<PaymentMock[]>([...MOCK_PAYMENTS]);
    private _installments = signal<PaymentInstallmentMock[]>([...MOCK_INSTALLMENTS]);
    private nextPaymentId = 200;
    private nextReceiptNum = 1000;

    // ── Pagos ─────────────────────────────────────────────────────────────────

    getAllPayments(filters?: PaymentFilter): Observable<PaymentMock[]> {
        let result = this._payments();

        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((p) => (p.studentName ?? '').toLowerCase().includes(q) || (p.receiptNumber ?? '').toLowerCase().includes(q) || (p.referenceNumber ?? '').toLowerCase().includes(q));
        }
        if (filters?.isActive !== undefined) result = result.filter((p) => p.isActive === filters.isActive);
        if (filters?.idStudent !== undefined) result = result.filter((p) => p.idStudent === filters.idStudent);
        if (filters?.dateFrom) result = result.filter((p) => p.paymentDate >= filters.dateFrom!);
        if (filters?.dateTo) result = result.filter((p) => p.paymentDate <= filters.dateTo!);

        return of([...result].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))).pipe(delay(this.DELAY_MS));
    }

    getPaymentById(id: number): Observable<PaymentMock | undefined> {
        return of(this._payments().find((p) => p.idPayment === id)).pipe(delay(this.DELAY_MS));
    }

    // ── Cuotas ────────────────────────────────────────────────────────────────

    getInstallments(filters?: InstallmentFilter): Observable<PaymentInstallmentMock[]> {
        let result = this._installments();
        const today = new Date().toISOString().split('T')[0];

        if (filters?.status) {
            result = result.filter((i) => i.status === filters.status);
        }
        if (filters?.idStudent !== undefined) {
            const planIds = MOCK_PAYMENT_PLANS.filter((p) => p.idStudent === filters.idStudent).map((p) => p.idStudentPaymentPlan);
            result = result.filter((i) => planIds.includes(i.idStudentPaymentPlan));
        }
        if (filters?.overdue) {
            result = result.filter((i) => i.dueDate < today && i.status !== 'PAID');
        }

        return of([...result].sort((a, b) => a.dueDate.localeCompare(b.dueDate))).pipe(delay(this.DELAY_MS));
    }

    getPendingInstallments(): Observable<PaymentInstallmentMock[]> {
        return this.getInstallments({ status: 'PENDING' });
    }

    getOverdueInstallments(): Observable<PaymentInstallmentMock[]> {
        return this.getInstallments({ overdue: true });
    }

    // ── Conceptos ─────────────────────────────────────────────────────────────

    getConcepts(): Observable<PaymentConceptMock[]> {
        return of(MOCK_PAYMENT_CONCEPTS).pipe(delay(this.DELAY_MS));
    }

    getPaymentMethods() {
        return of(MOCK_PAYMENT_METHODS.filter((m) => m.isActive)).pipe(delay(this.DELAY_MS));
    }

    // ── Registrar pago ────────────────────────────────────────────────────────

    registerPayment(req: NewPaymentRequest): Observable<PaymentMock> {
        const student = MOCK_STUDENTS.find((s) => s.idStudent === req.idStudent);
        const method = MOCK_PAYMENT_METHODS.find((m) => m.idPaymentMethod === req.idPaymentMethod);
        const receipt = `REC-${new Date().getFullYear()}-${String(this.nextReceiptNum++).padStart(5, '0')}`;

        const newPayment: PaymentMock = {
            idPayment: this.nextPaymentId++,
            idCompany: 1,
            idStudent: req.idStudent,
            studentName: student?.fullName ?? 'Desconocido',
            idPaymentInstallment: req.idPaymentInstallment,
            idPaymentMethod: req.idPaymentMethod,
            paymentMethodName: method?.name ?? 'Desconocido',
            paymentDate: req.paymentDate,
            amount: req.amount,
            receiptNumber: receipt,
            referenceNumber: req.referenceNumber,
            notes: req.notes,
            idReceivedByStaff: req.idReceivedByStaff,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this._payments.update((list) => [newPayment, ...list]);

        // Marcar cuota como PAID si se vinculó una
        if (req.idPaymentInstallment) {
            this._installments.update((list) => list.map((i) => (i.idPaymentInstallment === req.idPaymentInstallment ? { ...i, status: 'PAID', paidDate: req.paymentDate, paidAmount: req.amount, balance: 0 } : i)));
        }

        return of(newPayment).pipe(delay(600));
    }

    // ── Stats financieras ─────────────────────────────────────────────────────

    getFinancialStats(): Observable<{
        totalCollectedMonth: number;
        totalCollectedYear: number;
        pendingAmount: number;
        overdueAmount: number;
        paymentsThisMonth: number;
        overdueCount: number;
        pendingCount: number;
    }> {
        const today = new Date();
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const yearStr = `${today.getFullYear()}`;
        const todayStr = today.toISOString().split('T')[0];

        const allPay = this._payments().filter((p) => p.isActive);
        const allInst = this._installments().filter((i) => i.isActive);

        return of({
            totalCollectedMonth: allPay.filter((p) => p.paymentDate.startsWith(monthStr)).reduce((s, p) => s + p.amount, 0),
            totalCollectedYear: allPay.filter((p) => p.paymentDate.startsWith(yearStr)).reduce((s, p) => s + p.amount, 0),
            pendingAmount: allInst.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.balance, 0),
            overdueAmount: allInst.filter((i) => i.dueDate < todayStr && i.status !== 'PAID').reduce((s, i) => s + i.balance + i.lateFee, 0),
            paymentsThisMonth: allPay.filter((p) => p.paymentDate.startsWith(monthStr)).length,
            overdueCount: allInst.filter((i) => i.dueDate < todayStr && i.status !== 'PAID').length,
            pendingCount: allInst.filter((i) => i.status === 'PENDING').length
        }).pipe(delay(this.DELAY_MS));
    }
}
