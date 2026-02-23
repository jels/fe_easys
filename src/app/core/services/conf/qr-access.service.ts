// src/app/core/services/qr-access.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { AccessMode, MOCK_QR_ACCESS_LOGS, QrAccessLogMock } from '../../../shared/data/qr-access.mock';
import { CredentialPerson, CredentialsService } from './credentials.service';

export interface ScanResult {
    success: boolean;
    person?: CredentialPerson;
    message: string;
    isDuplicate: boolean;
    alreadyDone?: boolean; // bloqueado por regla de negocio
    blockedBy?: AccessMode;
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

// ── Reglas de estado por persona en el día ────────────────────────────────────
// Estado reconstruido de la secuencia de eventos:
//  outside : nunca entró hoy, o ya salió/fue retirado
//  inside  : hay una entrada sin salida/retiro posterior
//  retired : último evento fue RETIRO
//
// Transiciones permitidas:
//  outside  → ENTRADA ✓ | RETIRO ✗ | SALIDA ✗
//  inside   → ENTRADA ✗ | RETIRO ✓ | SALIDA ✓
//  retired  → ENTRADA ✓ | RETIRO ✗ | SALIDA ✗  (puede reingresar después de retiro)
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QrAccessService {
    private readonly DEDUP_MS = 3000;

    private _logs = signal<QrAccessLogMock[]>([...MOCK_QR_ACCESS_LOGS]);
    private _recentScans = new Map<string, number>();
    private nextId = 100;

    constructor(private credService: CredentialsService) {}

    // ── Registro principal ────────────────────────────────────────────────────

    registerAccess(token: string, mode: AccessMode): Observable<ScanResult> {
        // Anti-duplicado de frame
        const lastScan = this._recentScans.get(token);
        if (lastScan && Date.now() - lastScan < this.DEDUP_MS) {
            const person = this.credService.resolveToken(token);
            return of({ success: true, person: person ?? undefined, message: 'Ya registrado recientemente', isDuplicate: true });
        }

        // Resolver token
        const person = this.credService.resolveToken(token);
        if (!person || !person.isActive) {
            return of({ success: false, message: 'QR no reconocido o no autorizado', isDuplicate: false }).pipe(delay(100));
        }

        // Validar regla de negocio
        const check = this.validateMode(person.idPerson, person.personType, mode);
        if (!check.allowed) {
            return of({
                success: false,
                person,
                isDuplicate: false,
                message: check.message,
                alreadyDone: true,
                blockedBy: check.blockedBy
            }).pipe(delay(100));
        }

        // Guardar log
        const now = new Date().toISOString();
        const newLog: QrAccessLogMock = {
            idQrAccessLog: this.nextId++,
            idCompany: 1,
            hashCode: token,
            idPerson: person.idPerson,
            personType: person.personType,
            fullName: person.fullName,
            gradeName: person.personType === 'STUDENT' ? person.displayLabel : undefined,
            mode,
            registeredAt: now,
            idRegisteredByStaff: 1,
            registeredByName: 'Sistema QR',
            deviceInfo: navigator.userAgent.slice(0, 80),
            isActive: true
        };
        this._logs.update((l) => [newLog, ...l]);
        this._recentScans.set(token, Date.now());

        const labels: Record<AccessMode, string> = { ENTRADA: 'Entrada', RETIRO: 'Retiro', SALIDA: 'Salida' };
        return of({ success: true, person, message: `${labels[mode]} registrada correctamente`, isDuplicate: false, log: newLog } as any).pipe(delay(150));
    }

    // ── Validación de reglas de negocio ───────────────────────────────────────

    private validateMode(idPerson: number, personType: 'STUDENT' | 'STAFF', mode: AccessMode): { allowed: boolean; message: string; blockedBy?: AccessMode } {
        const today = new Date().toISOString().split('T')[0];
        const logs = this._logs()
            .filter((l) => l.isActive && l.idPerson === idPerson && l.personType === personType && l.registeredAt.startsWith(today))
            .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));

        // Reconstruir estado actual
        type State = 'outside' | 'inside' | 'retired';
        let state: State = 'outside';
        for (const l of logs) {
            if (l.mode === 'ENTRADA') state = 'inside';
            else if (l.mode === 'SALIDA') state = 'outside';
            else if (l.mode === 'RETIRO') state = 'retired';
        }

        if (mode === 'ENTRADA') {
            if (state === 'inside') return { allowed: false, message: 'Ya se registró la entrada — el alumno/a sigue adentro', blockedBy: 'ENTRADA' };
            return { allowed: true, message: '' };
        }
        if (mode === 'RETIRO') {
            if (state === 'outside') return { allowed: false, message: 'No hay entrada activa para registrar el retiro', blockedBy: 'ENTRADA' };
            if (state === 'retired') return { allowed: false, message: 'Ya se registró un retiro hoy', blockedBy: 'RETIRO' };
            return { allowed: true, message: '' };
        }
        if (mode === 'SALIDA') {
            if (state === 'outside') return { allowed: false, message: 'No hay entrada activa para registrar la salida', blockedBy: 'ENTRADA' };
            if (state === 'retired') return { allowed: false, message: 'El alumno/a ya fue retirado — no se puede registrar salida', blockedBy: 'RETIRO' };
            return { allowed: true, message: '' };
        }
        return { allowed: true, message: '' };
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    /** Signal reactiva — AccessControlService puede leerla para combinar listas */
    getLogs() {
        return this._logs;
    }

    getTodayQrLogs(): QrAccessLogMock[] {
        const today = new Date().toISOString().split('T')[0];
        return this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(today));
    }

    getTodayLogs(mode?: AccessMode): Observable<QrAccessLogMock[]> {
        const today = new Date().toISOString().split('T')[0];
        let r = this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(today));
        if (mode) r = r.filter((l) => l.mode === mode);
        return of([...r].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))).pipe(delay(200));
    }

    getAllLogs(mode?: AccessMode): Observable<QrAccessLogMock[]> {
        let r = this._logs().filter((l) => l.isActive);
        if (mode) r = r.filter((l) => l.mode === mode);
        return of([...r].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))).pipe(delay(200));
    }

    getDaySummary(): Observable<DaySummary> {
        const today = new Date().toISOString().split('T')[0];
        const logs = this._logs().filter((l) => l.isActive && l.registeredAt.startsWith(today));
        const ent = logs.filter((l) => l.mode === 'ENTRADA');
        const sal = logs.filter((l) => l.mode === 'SALIDA');
        const ret = logs.filter((l) => l.mode === 'RETIRO');
        const entIds = new Set(ent.filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson));
        const outIds = new Set([...sal, ...ret].filter((l) => l.personType === 'STUDENT').map((l) => l.idPerson));
        const inside = [...entIds].filter((id) => !outIds.has(id)).length;
        const sEnt = new Set(ent.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        const sSal = new Set(sal.filter((l) => l.personType === 'STAFF').map((l) => l.idPerson));
        return of({
            entradas: ent.length,
            retiros: ret.length,
            salidas: sal.length,
            ausentes: Math.max(0, 20 - ent.filter((l) => l.personType === 'STUDENT').length),
            studentsInside: inside,
            staffInside: [...sEnt].filter((id) => !sSal.has(id)).length,
            date: today
        }).pipe(delay(200));
    }
}
