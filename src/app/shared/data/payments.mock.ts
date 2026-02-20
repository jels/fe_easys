// src/app/shared/data/payments.mock.ts

export interface PaymentMethodMock {
    idPaymentMethod: number;
    idCompany: number;
    name: string;
    requiresReference: boolean;
    isActive: boolean;
}

export interface PaymentConceptMock {
    idPaymentConcept: number;
    idCompany: number;
    name: string;
    code: string;
    description?: string;
    amount: number;
    conceptCategory: string; // TUITION | ENROLLMENT | MATERIAL | UNIFORM | EVENT | OTHER
    isRecurring: boolean;
    recurrenceType?: string; // MONTHLY | ANNUAL
    isMandatory: boolean;
    isActive: boolean;
}

export interface StudentPaymentPlanMock {
    idStudentPaymentPlan: number;
    idStudent: number;
    studentName?: string;
    idSchoolYear: number;
    schoolYearName?: string;
    idPaymentConcept: number;
    conceptName?: string;
    totalAmount: number;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    installments: number;
    startDate: string;
    isActive: boolean;
}

export interface PaymentInstallmentMock {
    idPaymentInstallment: number;
    idStudentPaymentPlan: number;
    installmentNumber: number;
    dueDate: string;
    amount: number;
    paidAmount: number;
    balance: number;
    status: string; // PENDING | PAID | OVERDUE | PARTIAL
    paidDate?: string;
    overduedays: number;
    lateFee: number;
    isActive: boolean;
    studentName?: string;
    conceptName?: string;
}

export interface PaymentMock {
    idPayment: number;
    idCompany: number;
    idStudent: number;
    studentName?: string;
    idPaymentInstallment?: number;
    idPaymentMethod: number;
    paymentMethodName?: string;
    paymentDate: string;
    amount: number;
    referenceNumber?: string;
    receiptNumber?: string;
    timbrado?: string;
    notes?: string;
    idReceivedByStaff?: number;
    receivedByName?: string;
    status?: string;
    isActive: boolean;
    createdAt: string;
}

// ── Payment Methods ───────────────────────────────────────────────────────────
export const MOCK_PAYMENT_METHODS: PaymentMethodMock[] = [
    { idPaymentMethod: 1, idCompany: 1, name: 'Efectivo', requiresReference: false, isActive: true },
    { idPaymentMethod: 2, idCompany: 1, name: 'Transferencia Bancaria', requiresReference: true, isActive: true },
    { idPaymentMethod: 3, idCompany: 1, name: 'Tarjeta de Débito', requiresReference: true, isActive: true },
    { idPaymentMethod: 4, idCompany: 1, name: 'Tarjeta de Crédito', requiresReference: true, isActive: true },
    { idPaymentMethod: 5, idCompany: 1, name: 'Cheque', requiresReference: true, isActive: false }
];

// ── Payment Concepts ──────────────────────────────────────────────────────────
export const MOCK_PAYMENT_CONCEPTS: PaymentConceptMock[] = [
    { idPaymentConcept: 1, idCompany: 1, name: 'Mensualidad', code: 'MEN', description: 'Cuota mensual del año lectivo', amount: 850000, conceptCategory: 'TUITION', isRecurring: true, recurrenceType: 'MONTHLY', isMandatory: true, isActive: true },
    {
        idPaymentConcept: 2,
        idCompany: 1,
        name: 'Matrícula',
        code: 'MAT',
        description: 'Matrícula anual de inscripción',
        amount: 1500000,
        conceptCategory: 'ENROLLMENT',
        isRecurring: false,
        recurrenceType: undefined,
        isMandatory: true,
        isActive: true
    },
    {
        idPaymentConcept: 3,
        idCompany: 1,
        name: 'Material Didáctico',
        code: 'MAD',
        description: 'Kit de materiales del año',
        amount: 350000,
        conceptCategory: 'MATERIAL',
        isRecurring: false,
        recurrenceType: undefined,
        isMandatory: true,
        isActive: true
    },
    {
        idPaymentConcept: 4,
        idCompany: 1,
        name: 'Uniforme Escolar',
        code: 'UNI',
        description: 'Uniforme completo (2 juegos)',
        amount: 450000,
        conceptCategory: 'UNIFORM',
        isRecurring: false,
        recurrenceType: undefined,
        isMandatory: false,
        isActive: true
    },
    { idPaymentConcept: 5, idCompany: 1, name: 'Seguro Escolar', code: 'SEG', description: 'Seguro de accidentes anual', amount: 120000, conceptCategory: 'OTHER', isRecurring: false, recurrenceType: 'ANNUAL', isMandatory: true, isActive: true },
    {
        idPaymentConcept: 6,
        idCompany: 1,
        name: 'Actividades Extracurriculares',
        code: 'EXT',
        description: 'Talleres opcionales',
        amount: 200000,
        conceptCategory: 'OTHER',
        isRecurring: true,
        recurrenceType: 'MONTHLY',
        isMandatory: false,
        isActive: true
    }
];

// ── Payment Plans ─────────────────────────────────────────────────────────────
export const MOCK_PAYMENT_PLANS: StudentPaymentPlanMock[] = [
    {
        idStudentPaymentPlan: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        idPaymentConcept: 1,
        conceptName: 'Mensualidad',
        totalAmount: 8500000,
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: 8500000,
        installments: 10,
        startDate: '2025-02-01',
        isActive: true
    },
    {
        idStudentPaymentPlan: 2,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        idPaymentConcept: 2,
        conceptName: 'Matrícula',
        totalAmount: 1500000,
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: 1500000,
        installments: 1,
        startDate: '2025-02-01',
        isActive: true
    },
    {
        idStudentPaymentPlan: 3,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        idPaymentConcept: 1,
        conceptName: 'Mensualidad',
        totalAmount: 8500000,
        discountPercentage: 10,
        discountAmount: 850000,
        finalAmount: 7650000,
        installments: 10,
        startDate: '2025-02-01',
        isActive: true
    },
    {
        idStudentPaymentPlan: 4,
        idStudent: 3,
        studentName: 'Valentina Ramírez Silva',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        idPaymentConcept: 1,
        conceptName: 'Mensualidad',
        totalAmount: 8500000,
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: 8500000,
        installments: 10,
        startDate: '2025-02-01',
        isActive: true
    },
    {
        idStudentPaymentPlan: 5,
        idStudent: 4,
        studentName: 'Mateo Fernández Torres',
        idSchoolYear: 1,
        schoolYearName: 'Año Lectivo 2025',
        idPaymentConcept: 1,
        conceptName: 'Mensualidad',
        totalAmount: 8500000,
        discountPercentage: 0,
        discountAmount: 0,
        finalAmount: 8500000,
        installments: 10,
        startDate: '2025-02-01',
        isActive: true
    }
];

// ── Installments ──────────────────────────────────────────────────────────────
export const MOCK_INSTALLMENTS: PaymentInstallmentMock[] = [
    // Sofía - Mensualidad
    {
        idPaymentInstallment: 1,
        idStudentPaymentPlan: 1,
        installmentNumber: 1,
        dueDate: '2025-02-05',
        amount: 850000,
        paidAmount: 850000,
        balance: 0,
        status: 'PAID',
        paidDate: '2025-02-03',
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Sofía Martínez López',
        conceptName: 'Mensualidad'
    },
    {
        idPaymentInstallment: 2,
        idStudentPaymentPlan: 1,
        installmentNumber: 2,
        dueDate: '2025-03-05',
        amount: 850000,
        paidAmount: 0,
        balance: 850000,
        status: 'PENDING',
        paidDate: undefined,
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Sofía Martínez López',
        conceptName: 'Mensualidad'
    },
    {
        idPaymentInstallment: 3,
        idStudentPaymentPlan: 1,
        installmentNumber: 3,
        dueDate: '2025-04-05',
        amount: 850000,
        paidAmount: 0,
        balance: 850000,
        status: 'PENDING',
        paidDate: undefined,
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Sofía Martínez López',
        conceptName: 'Mensualidad'
    },
    // Sofía - Matrícula
    {
        idPaymentInstallment: 4,
        idStudentPaymentPlan: 2,
        installmentNumber: 1,
        dueDate: '2025-02-01',
        amount: 1500000,
        paidAmount: 1500000,
        balance: 0,
        status: 'PAID',
        paidDate: '2025-01-28',
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Sofía Martínez López',
        conceptName: 'Matrícula'
    },
    // Lucas - Mensualidad (con descuento 10%)
    {
        idPaymentInstallment: 5,
        idStudentPaymentPlan: 3,
        installmentNumber: 1,
        dueDate: '2025-02-05',
        amount: 765000,
        paidAmount: 765000,
        balance: 0,
        status: 'PAID',
        paidDate: '2025-02-04',
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Lucas González Benítez',
        conceptName: 'Mensualidad'
    },
    {
        idPaymentInstallment: 6,
        idStudentPaymentPlan: 3,
        installmentNumber: 2,
        dueDate: '2025-03-05',
        amount: 765000,
        paidAmount: 0,
        balance: 765000,
        status: 'PENDING',
        paidDate: undefined,
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Lucas González Benítez',
        conceptName: 'Mensualidad'
    },
    // Mateo - atrasado
    {
        idPaymentInstallment: 7,
        idStudentPaymentPlan: 5,
        installmentNumber: 1,
        dueDate: '2025-02-05',
        amount: 850000,
        paidAmount: 0,
        balance: 875000,
        status: 'OVERDUE',
        paidDate: undefined,
        overduedays: 14,
        lateFee: 25000,
        isActive: true,
        studentName: 'Mateo Fernández Torres',
        conceptName: 'Mensualidad'
    },
    {
        idPaymentInstallment: 8,
        idStudentPaymentPlan: 5,
        installmentNumber: 2,
        dueDate: '2025-03-05',
        amount: 850000,
        paidAmount: 0,
        balance: 850000,
        status: 'PENDING',
        paidDate: undefined,
        overduedays: 0,
        lateFee: 0,
        isActive: true,
        studentName: 'Mateo Fernández Torres',
        conceptName: 'Mensualidad'
    }
];

// ── Payments (recibos emitidos) ───────────────────────────────────────────────
export const MOCK_PAYMENTS: PaymentMock[] = [
    {
        idPayment: 1,
        idCompany: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idPaymentInstallment: 1,
        idPaymentMethod: 1,
        paymentMethodName: 'Efectivo',
        paymentDate: '2025-02-03',
        amount: 850000,
        receiptNumber: 'REC-2025-0001',
        timbrado: '12345678',
        notes: '',
        idReceivedByStaff: 2,
        receivedByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-03T10:00:00'
    },
    {
        idPayment: 2,
        idCompany: 1,
        idStudent: 1,
        studentName: 'Sofía Martínez López',
        idPaymentInstallment: 4,
        idPaymentMethod: 2,
        paymentMethodName: 'Transferencia Bancaria',
        paymentDate: '2025-01-28',
        amount: 1500000,
        receiptNumber: 'REC-2025-0002',
        timbrado: '12345678',
        notes: 'Matrícula 2025',
        referenceNumber: 'TRF-20250128-001',
        idReceivedByStaff: 2,
        receivedByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-01-28T11:00:00'
    },
    {
        idPayment: 3,
        idCompany: 1,
        idStudent: 2,
        studentName: 'Lucas González Benítez',
        idPaymentInstallment: 5,
        idPaymentMethod: 3,
        paymentMethodName: 'Tarjeta de Débito',
        paymentDate: '2025-02-04',
        amount: 765000,
        receiptNumber: 'REC-2025-0003',
        timbrado: '12345678',
        notes: '',
        idReceivedByStaff: 2,
        receivedByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-04T09:30:00'
    },
    {
        idPayment: 4,
        idCompany: 1,
        idStudent: 9,
        studentName: 'Luciana Vega Estigarribia',
        idPaymentInstallment: undefined,
        idPaymentMethod: 1,
        paymentMethodName: 'Efectivo',
        paymentDate: '2025-02-05',
        amount: 850000,
        receiptNumber: 'REC-2025-0004',
        timbrado: '12345678',
        notes: '',
        idReceivedByStaff: 2,
        receivedByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-05T08:45:00'
    }
];
