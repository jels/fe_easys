// src/app/core/services/conf/access-control.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
    MOCK_STUDENT_ACCESS_LOGS,
    MOCK_STAFF_ACCESS_LOGS,
    MOCK_STUDENT_INFRACTIONS,
    MOCK_INFRACTION_TYPES,
    MOCK_EARLY_DEPARTURES,
    StudentAccessLogMock,
    StaffAccessLogMock,
    StudentInfractionMock,
    InfractionTypeMock,
    EarlyDepartureMock
} from '../../../shared/data/operations.mock';

import { MOCK_STUDENTS } from '../../../shared/data/people.mock';

import { QrAccessLogMock } from '../../../shared/data/qr-access.mock';
import { QrAccessService } from './qr-access.service';
import { MOCK_STAFF } from '../../../shared/data/staff.mock';

export interface AccessFilter {
    date?: string;
    idStudent?: number;
    idStaff?: number;
    search?: string;
}

export interface AccessLogRequest {
    idStudent?: number;
    idStaff?: number;
    accessDate: string;
    entryTime?: string;
    exitTime?: string;
    isAbsent?: boolean;
    absenceJustified?: boolean;
    observations?: string;
}

export interface EarlyDepartureRequest {
    idStudent: number;
    departureDatetime: string;
    pickedUpByName: string;
    pickedUpByRelationship?: string;
    pickedUpByDocument?: string;
    reason?: string;
    parentAuthorization?: boolean;
    authorizedByStaffId?: number;
    observations?: string;
}

export interface InfractionRequest {
    idStudent: number;
    idInfractionType: number;
    incidentDate: string;
    incidentTime?: string;
    description: string;
    sanctionApplied?: string;
    parentNotified?: boolean;
    idReportedByStaff?: number;
    observations?: string;
}

@Injectable({ providedIn: 'root' })
export class AccessControlService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 350;

    private _studentLogs = signal<StudentAccessLogMock[]>([...MOCK_STUDENT_ACCESS_LOGS]);
    private _staffLogs = signal<StaffAccessLogMock[]>([...MOCK_STAFF_ACCESS_LOGS]);
    private _infractions = signal<StudentInfractionMock[]>([...MOCK_STUDENT_INFRACTIONS]);
    private _earlyDeps = signal<EarlyDepartureMock[]>([...MOCK_EARLY_DEPARTURES]);

    private nextLogId = 100;
    private nextInfId = 100;
    private nextDepId = 100;

    constructor(private qrService: QrAccessService) {}

    private todayStr(): string {
        return new Date().toISOString().split('T')[0];
    }

    // ── Convertir QrLog → StudentAccessLogMock ────────────────────────────────
    // Agrupa los QR logs por persona y construye una entrada/salida consolidada
    private qrLogsToStudentLogs(): StudentAccessLogMock[] {
        const qrLogs = this.qrService.getTodayQrLogs().filter((l) => l.personType === 'STUDENT');

        // Agrupar por idPerson para consolidar entrada/salida/retiro del día
        const byPerson = new Map<number, QrAccessLogMock[]>();
        for (const log of qrLogs) {
            if (!byPerson.has(log.idPerson)) byPerson.set(log.idPerson, []);
            byPerson.get(log.idPerson)!.push(log);
        }

        const today = this.todayStr();
        const result: StudentAccessLogMock[] = [];
        let syntheticId = 9000;

        for (const [idPerson, logs] of byPerson) {
            const sorted = [...logs].sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
            const entrada = sorted.find((l) => l.mode === 'ENTRADA');
            const salida = sorted.find((l) => l.mode === 'SALIDA');
            const retiro = sorted.find((l) => l.mode === 'RETIRO');

            if (!entrada) continue; // sin entrada no aparece en la lista

            result.push({
                idStudentAccessLog: syntheticId++,
                idStudent: idPerson,
                studentName: logs[0].fullName,
                gradeName: logs[0].gradeName ?? '',
                sectionName: '',
                accessDate: today,
                entryTime: entrada.registeredAt,
                exitTime: salida?.registeredAt ?? retiro?.registeredAt,
                isLate: false,
                isAbsent: false,
                absenceJustified: false,
                observations: retiro ? 'Retiro anticipado vía QR' : salida ? 'Salida vía QR' : 'Entrada vía QR',
                registeredByName: 'Sistema QR',
                isActive: true
            });
        }
        return result;
    }

    private qrLogsToStaffLogs(): StaffAccessLogMock[] {
        const qrLogs = this.qrService.getTodayQrLogs().filter((l) => l.personType === 'STAFF');

        const byPerson = new Map<number, QrAccessLogMock[]>();
        for (const log of qrLogs) {
            if (!byPerson.has(log.idPerson)) byPerson.set(log.idPerson, []);
            byPerson.get(log.idPerson)!.push(log);
        }

        const today = this.todayStr();
        const result: StaffAccessLogMock[] = [];
        let syntheticId = 9000;

        for (const [idPerson, logs] of byPerson) {
            const sorted = [...logs].sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
            const entrada = sorted.find((l) => l.mode === 'ENTRADA');
            const salida = sorted.find((l) => l.mode === 'SALIDA');
            if (!entrada) continue;

            const staffMock = MOCK_STAFF.find((s) => s.idStaff === idPerson);
            result.push({
                idStaffAccessLog: syntheticId++,
                idStaff: idPerson,
                staffName: logs[0].fullName,
                staffType: staffMock?.staffType ?? 'TEACHER',
                accessDate: today,
                entryTime: entrada.registeredAt,
                exitTime: salida?.registeredAt,
                isLate: false,
                observations: 'Registro vía QR',
                isActive: true
            });
        }
        return result;
    }

    // ── Estudiantes ───────────────────────────────────────────────────────────

    getStudentLogs(filters?: AccessFilter): Observable<StudentAccessLogMock[]> {
        // Combinar logs manuales + logs QR (QR solo agrega si no hay manual para esa persona/fecha)
        const manual = this._studentLogs();
        const qr = this.qrLogsToStudentLogs();
        const manualKeys = new Set(manual.map((l) => `${l.idStudent}-${l.accessDate}`));
        let result = [...manual, ...qr.filter((l) => !manualKeys.has(`${l.idStudent}-${l.accessDate}`))];

        if (filters?.date) result = result.filter((l) => l.accessDate === filters.date);
        if (filters?.idStudent) result = result.filter((l) => l.idStudent === filters.idStudent);
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((l) => (l.studentName ?? '').toLowerCase().includes(q));
        }
        return of(
            [...result].sort((a, b) => {
                const tA = a.entryTime ?? a.accessDate;
                const tB = b.entryTime ?? b.accessDate;
                return tB.localeCompare(tA);
            })
        ).pipe(delay(this.DELAY_MS));
    }

    getTodayStudentLogs(): Observable<StudentAccessLogMock[]> {
        return this.getStudentLogs({ date: this.todayStr() });
    }

    getTodayAbsents(): Observable<StudentAccessLogMock[]> {
        return of(this._studentLogs().filter((l) => l.accessDate === this.todayStr() && l.isAbsent)).pipe(delay(this.DELAY_MS));
    }

    registerStudentAccess(req: AccessLogRequest): Observable<StudentAccessLogMock> {
        const student = MOCK_STUDENTS.find((s) => s.idStudent === req.idStudent);
        const newLog: StudentAccessLogMock = {
            idStudentAccessLog: this.nextLogId++,
            idStudent: req.idStudent!,
            studentName: student?.fullName ?? 'Desconocido',
            gradeName: student?.gradeName ?? '',
            accessDate: req.accessDate,
            entryTime: req.entryTime,
            exitTime: req.exitTime,
            isLate: false,
            isAbsent: req.isAbsent ?? false,
            absenceJustified: req.absenceJustified ?? false,
            observations: req.observations,
            isActive: true
        };
        this._studentLogs.update((logs) => [newLog, ...logs]);
        return of(newLog).pipe(delay(this.DELAY_MS));
    }

    // ── Personal (Staff) ──────────────────────────────────────────────────────

    getStaffLogs(filters?: AccessFilter): Observable<StaffAccessLogMock[]> {
        const manual = this._staffLogs();
        const qr = this.qrLogsToStaffLogs();
        const manualKeys = new Set(manual.map((l) => `${l.idStaff}-${l.accessDate}`));
        let result = [...manual, ...qr.filter((l) => !manualKeys.has(`${l.idStaff}-${l.accessDate}`))];

        if (filters?.date) result = result.filter((l) => l.accessDate === filters.date);
        if (filters?.idStaff) result = result.filter((l) => l.idStaff === filters.idStaff);
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((l) => (l.staffName ?? '').toLowerCase().includes(q));
        }
        return of(
            [...result].sort((a, b) => {
                const tA = a.entryTime ?? a.accessDate;
                const tB = b.entryTime ?? b.accessDate;
                return tB.localeCompare(tA);
            })
        ).pipe(delay(this.DELAY_MS));
    }

    getTodayStaffLogs(): Observable<StaffAccessLogMock[]> {
        return this.getStaffLogs({ date: this.todayStr() });
    }

    registerStaffAccess(req: AccessLogRequest): Observable<StaffAccessLogMock> {
        const staff = MOCK_STAFF.find((s) => s.idStaff === req.idStaff);
        const newLog: StaffAccessLogMock = {
            idStaffAccessLog: this.nextLogId++,
            idStaff: req.idStaff!,
            staffName: staff?.fullName ?? 'Desconocido',
            staffType: staff?.staffType ?? 'TEACHER',
            accessDate: req.accessDate,
            entryTime: req.entryTime,
            exitTime: req.exitTime,
            isLate: false,
            observations: req.observations,
            isActive: true
        };
        this._staffLogs.update((logs) => [newLog, ...logs]);
        return of(newLog).pipe(delay(this.DELAY_MS));
    }

    // ── Retiros anticipados ───────────────────────────────────────────────────

    getEarlyDepartures(filters?: AccessFilter): Observable<EarlyDepartureMock[]> {
        let result = this._earlyDeps();
        if (filters?.date) result = result.filter((l) => l.departureDatetime.startsWith(filters.date!));
        if (filters?.idStudent) result = result.filter((l) => l.idStudent === filters.idStudent);
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((l) => (l.studentName ?? '').toLowerCase().includes(q) || (l.pickedUpByName ?? '').toLowerCase().includes(q));
        }
        return of([...result].sort((a, b) => b.departureDatetime.localeCompare(a.departureDatetime))).pipe(delay(this.DELAY_MS));
    }

    getTodayEarlyDepartures(): Observable<EarlyDepartureMock[]> {
        return this.getEarlyDepartures({ date: this.todayStr() });
    }

    registerEarlyDeparture(req: EarlyDepartureRequest): Observable<EarlyDepartureMock> {
        const student = MOCK_STUDENTS.find((s) => s.idStudent === req.idStudent);
        const authorizer = req.authorizedByStaffId ? MOCK_STAFF.find((s) => s.idStaff === req.authorizedByStaffId) : undefined;

        const newDep: EarlyDepartureMock = {
            idEarlyDeparture: this.nextDepId++,
            idStudent: req.idStudent,
            studentName: student?.fullName ?? 'Desconocido',
            gradeName: student?.gradeName ?? '',
            departureDatetime: req.departureDatetime,
            reason: req.reason ?? '',
            idAuthorizedByStaff: req.authorizedByStaffId,
            authorizedByName: authorizer?.fullName,
            pickedUpByName: req.pickedUpByName,
            pickedUpByRelationship: req.pickedUpByRelationship,
            pickedUpByDocument: req.pickedUpByDocument,
            parentAuthorization: req.parentAuthorization ?? false,
            observations: req.observations,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this._earlyDeps.update((deps) => [newDep, ...deps]);
        return of(newDep).pipe(delay(this.DELAY_MS));
    }

    // ── Infracciones ──────────────────────────────────────────────────────────

    getInfractionTypes(): Observable<InfractionTypeMock[]> {
        return of(MOCK_INFRACTION_TYPES).pipe(delay(this.DELAY_MS));
    }

    getInfractions(filters?: AccessFilter): Observable<StudentInfractionMock[]> {
        let result = this._infractions();
        if (filters?.date) result = result.filter((l) => l.incidentDate === filters.date);
        if (filters?.idStudent) result = result.filter((l) => l.idStudent === filters.idStudent);
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            result = result.filter((l) => (l.studentName ?? '').toLowerCase().includes(q) || (l.infractionTypeName ?? '').toLowerCase().includes(q));
        }
        return of([...result].sort((a, b) => b.incidentDate.localeCompare(a.incidentDate))).pipe(delay(this.DELAY_MS));
    }

    registerInfraction(req: InfractionRequest): Observable<StudentInfractionMock> {
        const student = MOCK_STUDENTS.find((s) => s.idStudent === req.idStudent);
        const infType = MOCK_INFRACTION_TYPES.find((t) => t.idInfractionType === req.idInfractionType);
        const reporter = req.idReportedByStaff ? MOCK_STAFF.find((s) => s.idStaff === req.idReportedByStaff) : undefined;

        const newInf: StudentInfractionMock = {
            idStudentInfraction: this.nextInfId++,
            idStudent: req.idStudent,
            studentName: student?.fullName ?? 'Desconocido',
            idInfractionType: req.idInfractionType,
            infractionTypeName: infType?.name ?? 'Desconocida',
            severity: infType?.severity ?? 'LOW',
            idReportedByStaff: req.idReportedByStaff,
            reportedByName: reporter?.fullName,
            incidentDate: req.incidentDate,
            incidentTime: req.incidentTime,
            description: req.description,
            sanctionApplied: req.sanctionApplied,
            parentNotified: req.parentNotified ?? false,
            observations: req.observations,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        this._infractions.update((infs) => [newInf, ...infs]);
        return of(newInf).pipe(delay(this.DELAY_MS));
    }

    // ── Stats del día ─────────────────────────────────────────────────────────

    getTodayStats(): Observable<{
        studentsPresentToday: number;
        studentsAbsentToday: number;
        studentsLateToday: number;
        staffPresentToday: number;
        staffAbsentToday: number;
        earlyDeparturesToday: number;
        infractionsPending: number;
    }> {
        const today = this.todayStr();
        // Combinar manuales + QR para las stats
        const qrStu = this.qrLogsToStudentLogs();
        const qrStf = this.qrLogsToStaffLogs();
        const manualStu = this._studentLogs().filter((l) => l.accessDate === today);
        const manualStf = this._staffLogs().filter((l) => l.accessDate === today);
        const manualKeys = new Set(manualStu.map((l) => l.idStudent));
        const stuLogs = [...manualStu, ...qrStu.filter((l) => !manualKeys.has(l.idStudent))];
        const stfKeys = new Set(manualStf.map((l) => l.idStaff));
        const stfLogs = [...manualStf, ...qrStf.filter((l) => !stfKeys.has(l.idStaff))];
        const deps = this._earlyDeps().filter((l) => l.departureDatetime.startsWith(today));

        return of({
            studentsPresentToday: stuLogs.filter((l) => !l.isAbsent).length,
            studentsAbsentToday: stuLogs.filter((l) => l.isAbsent).length,
            studentsLateToday: stuLogs.filter((l) => l.isLate).length,
            staffPresentToday: stfLogs.filter((l) => l.isActive !== false).length,
            staffAbsentToday: stfLogs.filter((l) => l.isActive === false).length,
            earlyDeparturesToday: deps.length,
            infractionsPending: this._infractions().filter((i) => i.isActive).length
        }).pipe(delay(this.DELAY_MS));
    }
}
