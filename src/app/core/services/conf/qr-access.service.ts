// src/app/core/services/qr-access.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AccessMode, MOCK_QR_ACCESS_LOGS, MOCK_QR_CODES, QrAccessLogMock, QrCodeMock } from '../../../shared/data/qr-access.mock';

export interface ScanResult {
    success: boolean;
    person?: QrCodeMock;
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
    private readonly DEMO_MODE = true;
    private readonly DEDUP_WINDOW_MS = 3000; // 3 seg anti-duplicado

    private _logs = signal<QrAccessLogMock[]>([...MOCK_QR_ACCESS_LOGS]);
    private _recentScans = new Map<string, number>(); // hashCode → timestamp
    private nextId = 100;

    // ── Resolver hash → persona ───────────────────────────────────────────────

    resolveHash(hashCode: string): QrCodeMock | null {
        return MOCK_QR_CODES.find((q) => q.hashCode === hashCode && q.isActive) ?? null;
    }

    // ── Registrar acceso ──────────────────────────────────────────────────────

    registerAccess(hashCode: string, mode: AccessMode): Observable<ScanResult> {
        // Anti-duplicado: mismo hash en los últimos 3 segundos
        const lastScan = this._recentScans.get(hashCode);
        if (lastScan && Date.now() - lastScan < this.DEDUP_WINDOW_MS) {
            const person = this.resolveHash(hashCode);
            return of({
                success: true,
                person: person ?? undefined,
                message: 'Ya registrado recientemente',
                isDuplicate: true
            });
        }

        const person = this.resolveHash(hashCode);
        if (!person) {
            return of({
                success: false,
                message: 'QR no reconocido',
                isDuplicate: false
            }).pipe(delay(100));
        }

        // Registrar
        const newLog: QrAccessLogMock = {
            idQrAccessLog: this.nextId++,
            idCompany: 1,
            hashCode,
            idPerson: person.idPerson,
            personType: person.personType,
            fullName: person.fullName,
            gradeName: person.gradeName,
            mode,
            registeredAt: new Date().toISOString(),
            idRegisteredByStaff: 2,
            registeredByName: 'Elena Figueredo Páez',
            deviceInfo: navigator.userAgent.slice(0, 100),
            isActive: true
        };

        this._logs.update((list) => [newLog, ...list]);
        this._recentScans.set(hashCode, Date.now());

        return of({
            success: true,
            person,
            message: `${mode} registrada — ${person.fullName}`,
            isDuplicate: false
        }).pipe(delay(150));
    }

    // ── Logs del día ──────────────────────────────────────────────────────────

    getTodayLogs(mode?: AccessMode): Observable<QrAccessLogMock[]> {
        // En demo: usar fecha fija con datos existentes
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

    // ── Resumen del día ───────────────────────────────────────────────────────

    getDaySummary(): Observable<DaySummary> {
        const todayPrefix = '2025-02-19';
        const logs = this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(todayPrefix));

        const entradas = logs.filter((l) => l.mode === 'ENTRADA');
        const salidas = logs.filter((l) => l.mode === 'SALIDA');
        const retiros = logs.filter((l) => l.mode === 'RETIRO');

        // Alumnos dentro = entraron pero no salieron ni fueron retirados
        const entradaIds = new Set(entradas.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson));
        const salidaIds = new Set([...salidas.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson), ...retiros.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson)]);
        const studentsInside = [...entradaIds].filter((id) => !salidaIds.has(id)).length;

        const staffEntradas = new Set(entradas.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        const staffSalidas = new Set(salidas.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        const staffInside = [...staffEntradas].filter((id) => !staffSalidas.has(id)).length;

        return of({
            entradas: entradas.length,
            retiros: retiros.length,
            salidas: salidas.length,
            ausentes: Math.max(0, 20 - entradas.filter((l) => l.personType === 'STUDENT').length),
            studentsInside,
            staffInside,
            date: todayPrefix
        }).pipe(delay(200));
    }
}
