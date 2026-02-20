// src/app/shared/data/company.mock.ts

export interface CompanyMock {
    idCompany: number;
    name: string;
    tradeName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
}

export interface BranchMock {
    idBranch: number;
    idCompany: number;
    name: string;
    code: string;
    address: string;
    phone: string;
    isMain: boolean;
    isActive: boolean;
}

export interface SystemParamMock {
    idParam: number;
    idCompany: number;
    paramKey: string;
    paramValue: string;
    paramType: string; // STRING | BOOLEAN | NUMBER | SELECT
    label: string;
    description?: string;
    category: string; // GENERAL | ACADEMIC | FINANCIAL | ACCESS | NOTIFICATIONS
    options?: string; // JSON array de opciones para tipo SELECT
    isEditable: boolean;
    isActive: boolean;
}

export const MOCK_COMPANY: CompanyMock = {
    idCompany: 1,
    name: 'Institución Educativa San José',
    tradeName: 'Colegio San José',
    ruc: '80012345-1',
    address: 'Av. Mcal. López 1234, Asunción',
    phone: '021-550000',
    email: 'info@colegiosanjose.edu.py',
    isActive: true
};

export const MOCK_BRANCHES: BranchMock[] = [
    {
        idBranch: 1,
        idCompany: 1,
        name: 'Sede Central',
        code: 'SC-001',
        address: 'Av. Mcal. López 1234, Asunción',
        phone: '021-550001',
        isMain: true,
        isActive: true
    },
    {
        idBranch: 2,
        idCompany: 1,
        name: 'Sede Norte',
        code: 'SN-002',
        address: 'Av. Santísima Trinidad 567, Asunción',
        phone: '021-550002',
        isMain: false,
        isActive: true
    }
];

export const MOCK_SYSTEM_PARAMS: SystemParamMock[] = [
    // ── General ───────────────────────────────────────────────────────────────
    { idParam: 1, idCompany: 1, paramKey: 'DEMO_MODE', paramValue: 'true', paramType: 'BOOLEAN', label: 'Modo Demo', description: 'Activa los datos de prueba en lugar del backend real', category: 'GENERAL', isEditable: true, isActive: true },
    {
        idParam: 2,
        idCompany: 1,
        paramKey: 'CURRENCY',
        paramValue: 'PYG',
        paramType: 'SELECT',
        label: 'Moneda',
        description: 'Moneda utilizada en los importes del sistema',
        category: 'GENERAL',
        options: '["PYG","USD","BRL","ARS"]',
        isEditable: true,
        isActive: true
    },
    { idParam: 3, idCompany: 1, paramKey: 'CURRENCY_SYMBOL', paramValue: 'Gs.', paramType: 'STRING', label: 'Símbolo de moneda', description: 'Símbolo que se muestra junto a los importes', category: 'GENERAL', isEditable: true, isActive: true },
    {
        idParam: 4,
        idCompany: 1,
        paramKey: 'DATE_FORMAT',
        paramValue: 'DD/MM/YYYY',
        paramType: 'SELECT',
        label: 'Formato de fecha',
        description: 'Formato de visualización de fechas',
        category: 'GENERAL',
        options: '["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]',
        isEditable: true,
        isActive: true
    },
    { idParam: 5, idCompany: 1, paramKey: 'TIMEZONE', paramValue: 'America/Asuncion', paramType: 'STRING', label: 'Zona horaria', description: 'Zona horaria del servidor', category: 'GENERAL', isEditable: false, isActive: true },
    // ── Académico ─────────────────────────────────────────────────────────────
    {
        idParam: 6,
        idCompany: 1,
        paramKey: 'PASSING_GRADE',
        paramValue: '2',
        paramType: 'NUMBER',
        label: 'Nota mínima aprobatoria',
        description: 'Promedio anual mínimo para aprobar una materia',
        category: 'ACADEMIC',
        isEditable: true,
        isActive: true
    },
    { idParam: 7, idCompany: 1, paramKey: 'MAX_GRADE', paramValue: '10', paramType: 'NUMBER', label: 'Nota máxima', description: 'Valor máximo posible de una calificación', category: 'ACADEMIC', isEditable: true, isActive: true },
    { idParam: 8, idCompany: 1, paramKey: 'GRADE_DECIMALS', paramValue: '2', paramType: 'NUMBER', label: 'Decimales en notas', description: 'Cantidad de decimales al redondear calificaciones', category: 'ACADEMIC', isEditable: true, isActive: true },
    {
        idParam: 9,
        idCompany: 1,
        paramKey: 'PERIOD_TYPE',
        paramValue: 'BIMESTRE',
        paramType: 'SELECT',
        label: 'Tipo de período',
        description: 'Unidad de división del año lectivo',
        category: 'ACADEMIC',
        options: '["BIMESTRE","TRIMESTRE","SEMESTRE"]',
        isEditable: true,
        isActive: true
    },
    // ── Financiero ────────────────────────────────────────────────────────────
    { idParam: 10, idCompany: 1, paramKey: 'LATE_FEE_PERCENT', paramValue: '2', paramType: 'NUMBER', label: 'Recargo mora (%)', description: 'Porcentaje de recargo por pago fuera de fecha', category: 'FINANCIAL', isEditable: true, isActive: true },
    { idParam: 11, idCompany: 1, paramKey: 'RECEIPT_PREFIX', paramValue: 'REC', paramType: 'STRING', label: 'Prefijo de recibos', description: 'Prefijo para la numeración de comprobantes', category: 'FINANCIAL', isEditable: true, isActive: true },
    {
        idParam: 12,
        idCompany: 1,
        paramKey: 'TIMBRADO_ACTIVE',
        paramValue: 'false',
        paramType: 'BOOLEAN',
        label: 'Timbrado habilitado',
        description: 'Activa la impresión de timbrado en los comprobantes',
        category: 'FINANCIAL',
        isEditable: true,
        isActive: true
    },
    // ── Control de Acceso ─────────────────────────────────────────────────────
    { idParam: 13, idCompany: 1, paramKey: 'ENTRY_TIME', paramValue: '07:15', paramType: 'STRING', label: 'Hora de entrada', description: 'Hora límite para considerar puntual la llegada', category: 'ACCESS', isEditable: true, isActive: true },
    {
        idParam: 14,
        idCompany: 1,
        paramKey: 'LATE_THRESHOLD_MIN',
        paramValue: '10',
        paramType: 'NUMBER',
        label: 'Tolerancia llegada tardía (min)',
        description: 'Minutos de tolerancia antes de marcar tardanza',
        category: 'ACCESS',
        isEditable: true,
        isActive: true
    },
    {
        idParam: 15,
        idCompany: 1,
        paramKey: 'ACCESS_NFC_ENABLED',
        paramValue: 'false',
        paramType: 'BOOLEAN',
        label: 'NFC habilitado',
        description: 'Activa el control de acceso por dispositivos NFC',
        category: 'ACCESS',
        isEditable: true,
        isActive: true
    },
    // ── Notificaciones ────────────────────────────────────────────────────────
    {
        idParam: 16,
        idCompany: 1,
        paramKey: 'NOTIF_EMAIL_ENABLED',
        paramValue: 'false',
        paramType: 'BOOLEAN',
        label: 'Notificaciones por email',
        description: 'Envío de notificaciones por correo electrónico',
        category: 'NOTIFICATIONS',
        isEditable: true,
        isActive: true
    },
    {
        idParam: 17,
        idCompany: 1,
        paramKey: 'NOTIF_SMS_ENABLED',
        paramValue: 'false',
        paramType: 'BOOLEAN',
        label: 'Notificaciones por SMS',
        description: 'Envío de notificaciones por mensaje de texto',
        category: 'NOTIFICATIONS',
        isEditable: true,
        isActive: true
    },
    {
        idParam: 18,
        idCompany: 1,
        paramKey: 'NOTIF_ABSENCE_AUTO',
        paramValue: 'true',
        paramType: 'BOOLEAN',
        label: 'Notif. ausencia automática',
        description: 'Notifica automáticamente al padre ante ausencia',
        category: 'NOTIFICATIONS',
        isEditable: true,
        isActive: true
    }
];
