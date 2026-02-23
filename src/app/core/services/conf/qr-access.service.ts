// src/app/core/services/qr-access.service.ts
// ACTUALIZADO: usa CredentialsService para resolver tokens en lugar del hashCode fijo del mock
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CredentialsService, CredentialPerson } from './credentials.service';
import { AccessMode, MOCK_QR_ACCESS_LOGS, QrAccessLogMock } from '../../../shared/data/qr-access.mock';

export interface ScanResult {
    success: boolean;
    person?: CredentialPerson;
    message: string;
    isDuplicate: boolean;
}

export interface DaySummary {
    entradas: number;
    retiros: number;
    salidas: number;
    ausentes: number;
    studentsInside: number;
    staffInside: number;
    date: string;
}

@Injectable({ providedIn: 'root' })
export class QrAccessService {
    private readonly DEDUP_WINDOW_MS = 3000;

    private _logs = signal<QrAccessLogMock[]>([...MOCK_QR_ACCESS_LOGS]);
    private _recentScans = new Map<string, number>();
    private nextId = 100;

    constructor(private credService: CredentialsService) {}

    // ── Registrar acceso por token ────────────────────────────────────────────

    registerAccess(token: string, mode: AccessMode): Observable<ScanResult> {
        // Anti-duplicado
        const lastScan = this._recentScans.get(token);
        if (lastScan && Date.now() - lastScan < this.DEDUP_WINDOW_MS) {
            const person = this.credService.resolveToken(token);
            return of({ success: true, person: person ?? undefined, message: 'Ya registrado recientemente', isDuplicate: true });
        }

        // Resolver token → persona
        const person = this.credService.resolveToken(token);
        if (!person || !person.isActive) {
            return of({ success: false, message: 'QR inválido o no autorizado', isDuplicate: false }).pipe(delay(100));
        }

        const newLog: QrAccessLogMock = {
            idQrAccessLog: this.nextId++,
            idCompany: 1,
            hashCode: token,
            idPerson: person.idPerson,
            personType: person.personType,
            fullName: person.fullName,
            gradeName: person.personType === 'STUDENT' ? person.displayLabel : undefined,
            mode,
            registeredAt: new Date().toISOString(),
            idRegisteredByStaff: 1,
            registeredByName: 'Sistema',
            deviceInfo: navigator.userAgent.slice(0, 100),
            isActive: true
        };

        this._logs.update((list) => [newLog, ...list]);
        this._recentScans.set(token, Date.now());

        return of({ success: true, person, message: `${mode} registrada`, isDuplicate: false }).pipe(delay(150));
    }

    getTodayLogs(mode?: AccessMode): Observable<QrAccessLogMock[]> {
        const todayPrefix = '2025-02-19';
        let result = this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(todayPrefix));
        if (mode) result = result.filter((l) => l.mode === mode);
        return of([...result].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))).pipe(delay(200));
    }

    getAllLogs(mode?: AccessMode): Observable<QrAccessLogMock[]> {
        let result = this._logs().filter((l) => l.isActive);
        if (mode) result = result.filter((l) => l.mode === mode);
        return of([...result].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))).pipe(delay(200));
    }

    getDaySummary(): Observable<DaySummary> {
        const todayPrefix = '2025-02-19';
        const logs = this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(todayPrefix));
        const entradas = logs.filter((l) => l.mode === 'ENTRADA');
        const salidas = logs.filter((l) => l.mode === 'SALIDA');
        const retiros = logs.filter((l) => l.mode === 'RETIRO');

        const entradaIds = new Set(entradas.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson));
        const salidaIds = new Set([...salidas.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson), ...retiros.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson)]);
        const studentsInside = [...entradaIds].filter((id) => !salidaIds.has(id)).length;
        const staffEntradas = new Set(entradas.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        const staffSalidas = new Set(salidas.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        const staffInside = [...staffEntradas].filter((id) => !staffSalidas.has(id)).length;

        return of({ entradas: entradas.length, retiros: retiros.length, salidas: salidas.length, ausentes: Math.max(0, 20 - entradas.filter((l) => l.personType === 'STUDENT').length), studentsInside, staffInside, date: todayPrefix }).pipe(
            delay(200)
        );
    }
}
