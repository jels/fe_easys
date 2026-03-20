// src/app/core/models/cash.models.ts

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type CashMovementType = 'INCOME' | 'EXPENSE';

export type CashCategory = 'TUITION_PAYMENT' | 'ENROLLMENT_PAYMENT' | 'SUPPLIER_PAYMENT' | 'SALARY' | 'OPERATIONAL_EXPENSE' | 'OTHER_INCOME' | 'OTHER_EXPENSE';

export type CashPaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'CHECK';

// ── Responses ─────────────────────────────────────────────────────────────────

export interface CashConceptResponse {
    idCashConcept: number;
    name: string;
    code: string;
    movementType: string; // INCOME | EXPENSE | BOTH
    category: string;
    description?: string | null;
}

export interface CashMovementResponse {
    idCashMovement: number;
    idCashConcept: number;
    conceptName: string;
    conceptCategory: string;
    idBranch?: number | null;
    branchName?: string | null;
    movementType: CashMovementType;
    movementDate: string; // yyyy-MM-dd
    amount: number;
    description?: string | null;
    referenceNumber?: string | null;
    beneficiaryName?: string | null;
    paymentMethod?: string | null;
    idPayment?: number | null;
    notes?: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface CashDailySummaryResponse {
    date: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    movementCount: number;
    cumulativeBalance: number;
}

export interface CashStatsResponse {
    todayIncome: number;
    todayExpense: number;
    todayBalance: number;
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    todayMovements: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateCashMovementRequest {
    idCompany: number;
    idBranch?: number;
    idCashConcept: number;
    movementType: CashMovementType;
    movementDate?: string; // yyyy-MM-dd, default hoy
    amount: number;
    description?: string;
    referenceNumber?: string;
    beneficiaryName?: string;
    paymentMethod?: CashPaymentMethod;
    idPayment?: number;
    notes?: string;
}

export interface UpdateCashMovementRequest {
    idCashConcept?: number;
    movementType?: CashMovementType;
    movementDate?: string;
    amount?: number;
    description?: string;
    referenceNumber?: string;
    beneficiaryName?: string;
    paymentMethod?: CashPaymentMethod;
    notes?: string;
}
