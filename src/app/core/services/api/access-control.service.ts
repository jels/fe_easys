// src/app/core/services/api/access-control.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { StudentAccessLogResponse, StaffAccessLogResponse, InfractionTypeResponse, StudentInfractionResponse, EarlyDepartureResponse, OperationsStatsResponse } from '../../models/operations.models';
import { PageResponse } from '../../models/student.dto';

export interface AccessFilter {
    date?: string;
    idStudent?: number;
    idStaff?: number;
    search?: string;
    page?: number;
    size?: number;
}

export interface AccessLogRequest {
    idStudent?: number;
    accessDate: string;
    entryTime?: string;
    exitTime?: string;
    isAbsent?: boolean;
    absenceJustified?: boolean;
    observations?: string;
    idRegisteredByStaff?: number;
}

export interface StaffAccessRequest {
    idStaff: number;
    accessDate: string;
    entryTime?: string;
    exitTime?: string;
    isLate?: boolean;
    observations?: string;
}

export interface EarlyDepartureRequest {
    idStudent: number;
    departureDatetime: string;
    reason: string;
    pickedUpByName?: string;
    pickedUpByRelationship?: string;
    pickedUpByDocument?: string;
    parentAuthorization?: boolean;
    idAuthorizedByStaff?: number;
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
    private readonly API = `${environment.apiUrl}operations`;

    constructor(private http: HttpClient) {}

    // ── Student Access Logs ───────────────────────────────────────────────────

    // GET /api/v1/operations/access/students?idCompany=&date=
    getStudentLogs(idCompany: number, filters?: AccessFilter): Observable<ApiResponse<StudentAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters?.date) params = params.set('date', filters.date);
        return this.http.get<ApiResponse<StudentAccessLogResponse[]>>(`${this.API}/access/students`, { params });
    }

    getTodayStudentLogs(idCompany: number): Observable<ApiResponse<StudentAccessLogResponse[]>> {
        return this.getStudentLogs(idCompany, {
            date: new Date().toISOString().split('T')[0]
        });
    }

    // GET /api/v1/operations/access/students/by-student/{idStudent}
    getLogsByStudent(idStudent: number): Observable<ApiResponse<StudentAccessLogResponse[]>> {
        return this.http.get<ApiResponse<StudentAccessLogResponse[]>>(`${this.API}/access/students/by-student/${idStudent}`);
    }

    // POST /api/v1/operations/access/students
    registerStudentAccess(request: AccessLogRequest): Observable<ApiResponse<StudentAccessLogResponse>> {
        return this.http.post<ApiResponse<StudentAccessLogResponse>>(`${this.API}/access/students`, request);
    }

    // PUT /api/v1/operations/access/students/{idLog}
    updateStudentAccess(idLog: number, request: AccessLogRequest): Observable<ApiResponse<StudentAccessLogResponse>> {
        return this.http.put<ApiResponse<StudentAccessLogResponse>>(`${this.API}/access/students/${idLog}`, request);
    }

    // PATCH /api/v1/operations/access/students/{idLog}/justify?reason=
    justifyAbsence(idLog: number, reason: string): Observable<ApiResponse<void>> {
        const params = new HttpParams().set('reason', reason);
        return this.http.patch<ApiResponse<void>>(`${this.API}/access/students/${idLog}/justify`, null, { params });
    }

    // ── Staff Access Logs ─────────────────────────────────────────────────────

    // GET /api/v1/operations/access/staff?idCompany=&date=
    getStaffLogs(idCompany: number, filters?: AccessFilter): Observable<ApiResponse<StaffAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filters?.date) params = params.set('date', filters.date);
        return this.http.get<ApiResponse<StaffAccessLogResponse[]>>(`${this.API}/access/staff`, { params });
    }

    getTodayStaffLogs(idCompany: number): Observable<ApiResponse<StaffAccessLogResponse[]>> {
        return this.getStaffLogs(idCompany, {
            date: new Date().toISOString().split('T')[0]
        });
    }

    // POST /api/v1/operations/access/staff (upsert por persona+fecha)
    registerStaffAccess(request: StaffAccessRequest): Observable<ApiResponse<StaffAccessLogResponse>> {
        return this.http.post<ApiResponse<StaffAccessLogResponse>>(`${this.API}/access/staff`, request);
    }

    // ── Infraction Types ──────────────────────────────────────────────────────

    // GET /api/v1/operations/infractions/types?idCompany=
    getInfractionTypes(idCompany: number): Observable<ApiResponse<InfractionTypeResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<InfractionTypeResponse[]>>(`${this.API}/infractions/types`, { params });
    }

    // ── Student Infractions ───────────────────────────────────────────────────

    // GET /api/v1/operations/infractions?idCompany=&idStudent=&severity=&page=&size=
    getInfractions(idCompany: number, filters?: AccessFilter & { severity?: string }): Observable<ApiResponse<PageResponse<StudentInfractionResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 50);
        if (filters?.idStudent) params = params.set('idStudent', filters.idStudent);
        if ((filters as any)?.severity) params = params.set('severity', (filters as any).severity);
        return this.http.get<ApiResponse<PageResponse<StudentInfractionResponse>>>(`${this.API}/infractions`, { params });
    }

    // POST /api/v1/operations/infractions
    registerInfraction(request: InfractionRequest): Observable<ApiResponse<StudentInfractionResponse>> {
        return this.http.post<ApiResponse<StudentInfractionResponse>>(`${this.API}/infractions`, request);
    }

    // PATCH /api/v1/operations/infractions/{id}/notify-parent
    notifyParent(idInfraction: number): Observable<ApiResponse<StudentInfractionResponse>> {
        return this.http.patch<ApiResponse<StudentInfractionResponse>>(`${this.API}/infractions/${idInfraction}/notify-parent`, null);
    }

    // ── Early Departures ──────────────────────────────────────────────────────

    // GET /api/v1/operations/early-departures?idCompany=&date=&page=&size=
    getEarlyDepartures(idCompany: number, filters?: AccessFilter): Observable<ApiResponse<PageResponse<EarlyDepartureResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filters?.page ?? 0)
            .set('size', filters?.size ?? 50);
        if (filters?.date) params = params.set('date', filters.date);
        return this.http.get<ApiResponse<PageResponse<EarlyDepartureResponse>>>(`${this.API}/early-departures`, { params });
    }

    getTodayEarlyDepartures(idCompany: number): Observable<ApiResponse<PageResponse<EarlyDepartureResponse>>> {
        return this.getEarlyDepartures(idCompany, {
            date: new Date().toISOString().split('T')[0]
        });
    }

    // POST /api/v1/operations/early-departures
    registerEarlyDeparture(request: EarlyDepartureRequest): Observable<ApiResponse<EarlyDepartureResponse>> {
        return this.http.post<ApiResponse<EarlyDepartureResponse>>(`${this.API}/early-departures`, request);
    }

    // PATCH /api/v1/operations/early-departures/{id}/return?returnDate=
    registerReturn(idEarlyDeparture: number, returnDate: string): Observable<ApiResponse<EarlyDepartureResponse>> {
        const params = new HttpParams().set('returnDate', returnDate);
        return this.http.patch<ApiResponse<EarlyDepartureResponse>>(`${this.API}/early-departures/${idEarlyDeparture}/return`, null, { params });
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    // GET /api/v1/operations/stats?idCompany=
    getTodayStats(idCompany: number): Observable<ApiResponse<OperationsStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<OperationsStatsResponse>>(`${this.API}/stats`, { params });
    }
}
