// ============================================================
// FILE: operations.models.ts
// src/app/core/models/operations.models.ts
// ============================================================

export interface StudentAccessLogResponse {
    idStudentAccessLog: number;
    idStudent: number;
    studentName: string;
    gradeName?: string | null;
    sectionName?: string | null;
    accessDate: string;
    entryTime?: string | null;
    exitTime?: string | null;
    isLate: boolean;
    isAbsent: boolean;
    absenceJustified: boolean;
    absenceReason?: string | null;
    idRegisteredByStaff?: number | null;
    registeredByName?: string | null;
    observations?: string | null;
    isActive: boolean;
}

export interface StaffAccessLogResponse {
    idStaffAccessLog: number;
    idStaff: number;
    staffName: string;
    staffType?: string | null;
    position?: string | null;
    accessDate: string;
    entryTime?: string | null;
    exitTime?: string | null;
    isLate: boolean;
    observations?: string | null;
    isActive: boolean;
}

export interface InfractionTypeResponse {
    idInfractionType: number;
    idCompany: number;
    name: string;
    severity: string; // LOW | MEDIUM | HIGH | CRITICAL
    description?: string | null;
    defaultSanction?: string | null;
    isActive: boolean;
}

export interface StudentInfractionResponse {
    idStudentInfraction: number;
    idStudent: number;
    studentName: string;
    idInfractionType: number;
    infractionTypeName: string;
    severity: string;
    idReportedByStaff?: number | null;
    reportedByName?: string | null;
    incidentDate: string;
    incidentTime?: string | null;
    description: string;
    sanctionApplied?: string | null;
    parentNotified: boolean;
    parentNotifiedAt?: string | null;
    observations?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface EarlyDepartureResponse {
    idEarlyDeparture: number;
    idStudent: number;
    studentName: string;
    gradeName?: string | null;
    departureDatetime: string;
    reason: string;
    idAuthorizedByStaff?: number | null;
    authorizedByName?: string | null;
    pickedUpByName?: string | null;
    pickedUpByDocument?: string | null;
    pickedUpByRelationship?: string | null;
    parentAuthorization: boolean;
    returnDatetime?: string | null;
    observations?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface OperationsStatsResponse {
    presentToday: number;
    absentToday: number;
    lateToday: number;
    absentUnjustified: number;
    infractionsPendingNotification: number;
    earlyDeparturesToday: number;
    criticalInfractions: number;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface InfractionFilter {
    idStudent?: number;
    severity?: string;
}

// ============================================================
// FILE: payments.models.ts
// src/app/core/models/payments.models.ts
// ============================================================

export interface PaymentMethodResponse {
    idPaymentMethod: number;
    idCompany: number;
    name: string;
    requiresReference: boolean;
    isActive: boolean;
}

export interface PaymentConceptResponse {
    idPaymentConcept: number;
    idCompany: number;
    name: string;
    code: string;
    conceptCategory: string;
    description?: string | null;
    amount: number;
    isRecurring: boolean;
    recurrenceType?: string | null;
    isMandatory: boolean;
    paymentOrder: number;
    isActive: boolean;
}

export interface StudentPaymentPlanResponse {
    idStudentPaymentPlan: number;
    idStudent: number;
    studentName: string;
    idSchoolYear: number;
    schoolYearName: string;
    idPaymentConcept: number;
    conceptName: string;
    conceptCategory: string;
    totalAmount: number;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    installments: number;
    startDate: string;
    isActive: boolean;
}

export interface PaymentInstallmentResponse {
    idPaymentInstallment: number;
    idStudentPaymentPlan: number;
    idStudent: number;
    studentName: string;
    conceptName: string;
    installmentNumber: number;
    dueDate: string;
    amount: number;
    paidAmount: number;
    balance: number;
    status: string; // PENDING | PAID | OVERDUE | PARTIAL
    paidDate?: string | null;
    overdueDays: number;
    lateFee: number;
    isActive: boolean;
}

export interface PaymentResponse {
    idPayment: number;
    idCompany: number;
    idStudent: number;
    studentName: string;
    idPaymentInstallment?: number | null;
    idPaymentMethod: number;
    paymentMethodName: string;
    paymentDate: string;
    amount: number;
    referenceNumber?: string | null;
    receiptNumber?: string | null;
    timbrado?: string | null;
    notes?: string | null;
    idReceivedByStaff?: number | null;
    receivedByName?: string | null;
    isActive: boolean;
    createdAt?: string;
}

export interface PaymentStatsResponse {
    totalCollectedMonth: number;
    totalCollectedYear: number;
    pendingAmount: number;
    overdueAmount: number;
    paymentsThisMonth: number;
    overdueCount: number;
    pendingCount: number;
}
