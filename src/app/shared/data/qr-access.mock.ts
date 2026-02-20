// src/app/shared/data/qr-access.mock.ts
// Mock de registros de acceso por QR — alineado a ea_qr_access_logs en la BD

export type AccessMode = 'ENTRADA' | 'RETIRO' | 'SALIDA';
export type PersonType = 'STUDENT' | 'STAFF';

export interface QrCodeMock {
    idQrCode: number;
    idPerson: number;
    personType: PersonType;
    hashCode: string; // hash único impreso en el carnet
    fullName: string;
    gradeName?: string; // solo para alumnos
    photoUrl?: string;
    isActive: boolean;
}

export interface QrAccessLogMock {
    idQrAccessLog: number;
    idCompany: number;
    hashCode: string;
    idPerson: number;
    personType: PersonType;
    fullName: string;
    gradeName?: string;
    mode: AccessMode;
    registeredAt: string; // ISO datetime
    idRegisteredByStaff?: number;
    registeredByName?: string;
    deviceInfo?: string;
    isActive: boolean;
}

// ── QR Codes de alumnos y personal ────────────────────────────────────────────
// hashCode = SHA-like string que va impreso en el carnet
export const MOCK_QR_CODES: QrCodeMock[] = [
    // Alumnos
    { idQrCode: 1, idPerson: 1, personType: 'STUDENT', hashCode: 'STU-a3f9b1c2d4e5', fullName: 'Sofía Martínez López', gradeName: '8° Grado A', isActive: true },
    { idQrCode: 2, idPerson: 2, personType: 'STUDENT', hashCode: 'STU-b7e2c8f1a0d3', fullName: 'Lucas González Benítez', gradeName: '9° Grado A', isActive: true },
    { idQrCode: 3, idPerson: 3, personType: 'STUDENT', hashCode: 'STU-c1d5e9f3b2a8', fullName: 'Valentina Ramírez Silva', gradeName: '7° Grado A', isActive: true },
    { idQrCode: 4, idPerson: 4, personType: 'STUDENT', hashCode: 'STU-d4a7b0c6e1f9', fullName: 'Mateo Fernández Torres', gradeName: '1° Curso A', isActive: true },
    { idQrCode: 5, idPerson: 5, personType: 'STUDENT', hashCode: 'STU-e8f2a5d9c3b1', fullName: 'Isabella Díaz Morales', gradeName: '8° Grado B', isActive: true },
    { idQrCode: 6, idPerson: 6, personType: 'STUDENT', hashCode: 'STU-f0b4c7e2d8a6', fullName: 'Santiago Ortiz Cabrera', gradeName: '9° Grado A', isActive: true },
    // Personal
    { idQrCode: 7, idPerson: 1, personType: 'STAFF', hashCode: 'STA-g2c9d1f4a7b5', fullName: 'Roberto Sánchez Duarte', isActive: true },
    { idQrCode: 8, idPerson: 2, personType: 'STAFF', hashCode: 'STA-h5e3b8c0f2a9', fullName: 'Elena Figueredo Páez', isActive: true },
    { idQrCode: 9, idPerson: 3, personType: 'STAFF', hashCode: 'STA-i7f1a4d6e0c3', fullName: 'Carlos Benítez Coronel', isActive: true },
    { idQrCode: 10, idPerson: 4, personType: 'STAFF', hashCode: 'STA-j9a6c2f8b4d1', fullName: 'Laura Valdez Ocampos', isActive: true }
];

export const MOCK_QR_ACCESS_LOGS: QrAccessLogMock[] = [
    {
        idQrAccessLog: 1,
        idCompany: 1,
        hashCode: 'STU-a3f9b1c2d4e5',
        idPerson: 1,
        personType: 'STUDENT',
        fullName: 'Sofía Martínez López',
        gradeName: '8° Grado A',
        mode: 'ENTRADA',
        registeredAt: '2025-02-19T07:15:00',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true
    },
    {
        idQrAccessLog: 2,
        idCompany: 1,
        hashCode: 'STU-b7e2c8f1a0d3',
        idPerson: 2,
        personType: 'STUDENT',
        fullName: 'Lucas González Benítez',
        gradeName: '9° Grado A',
        mode: 'ENTRADA',
        registeredAt: '2025-02-19T07:32:00',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true
    },
    {
        idQrAccessLog: 3,
        idCompany: 1,
        hashCode: 'STA-g2c9d1f4a7b5',
        idPerson: 1,
        personType: 'STAFF',
        fullName: 'Roberto Sánchez Duarte',
        mode: 'ENTRADA',
        registeredAt: '2025-02-19T06:45:00',
        idRegisteredByStaff: 2,
        registeredByName: 'Elena Figueredo Páez',
        isActive: true
    }
];
