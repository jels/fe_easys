// src/app/core/models/qr.models.ts

export interface QrCodeResponse {
    idQrCode: number;
    idCompany: number;
    personType: string; // STUDENT | STAFF
    idPerson: number;
    token: string;
    issuedAt: string;
    isActive: boolean;
    // Enriquecidos en el service
    fullName?: string | null;
    displayLabel?: string | null;
    photoUrl?: string | null;
}

export interface QrScanResultResponse {
    success: boolean;
    message: string;
    isDuplicate: boolean;
    blocked: boolean;
    blockedReason?: string | null;
    idPerson?: number | null;
    personType?: string | null;
    fullName?: string | null;
    displayLabel?: string | null;
    photoUrl?: string | null;
    currentState?: string | null; // outside | inside | retired
    registeredAt?: string | null;
}

export interface QrAccessLogResponse {
    idQrAccessLog: number;
    idCompany: number;
    token: string;
    personType: string;
    idPerson: number;
    fullName?: string | null;
    gradeName?: string | null;
    mode: string; // ENTRADA | RETIRO | SALIDA
    registeredAt: string;
    idRegisteredByStaff?: number | null;
    registeredByName?: string | null;
    deviceInfo?: string | null;
    isActive: boolean;
}

export interface QrDaySummaryResponse {
    entradas: number;
    retiros: number;
    salidas: number;
    studentsInside: number;
    staffInside: number;
    date: string;
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface GenerateQrRequest {
    idCompany: number;
    personType: string; // STUDENT | STAFF
    idPerson: number;
}

export interface RegisterQrAccessRequest {
    idCompany: number;
    token: string;
    mode: string; // ENTRADA | RETIRO | SALIDA
    idRegisteredByStaff?: number;
    deviceInfo?: string;
}
