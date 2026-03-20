// ============================================================
// FILE: operations.service.ts
// src/app/core/services/api/operations.service.ts
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import { StudentAccessLogResponse, StaffAccessLogResponse, InfractionTypeResponse, StudentInfractionResponse, EarlyDepartureResponse, OperationsStatsResponse, InfractionFilter } from '../../models/operations.models';
import { PageResponse } from '../../models/student.dto';

@Injectable({ providedIn: 'root' })
export class OperationsService {
    private readonly API = `${environment.apiUrl}operations`;

    constructor(private http: HttpClient) {}

    // ── Student Access Logs ───────────────────────────────────────────────────

    getStudentAccessLogs(idCompany: number, date?: string): Observable<ApiResponse<StudentAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<StudentAccessLogResponse[]>>(`${this.API}/access/students`, { params });
    }

    // GET /api/v1/operations/access/students/by-student/{idStudent}
    getStudentAccessLogsByStudent(idStudent: number): Observable<ApiResponse<StudentAccessLogResponse[]>> {
        return this.http.get<ApiResponse<StudentAccessLogResponse[]>>(`${this.API}/access/students/by-student/${idStudent}`);
    }

    registerStudentAccess(request: any): Observable<ApiResponse<StudentAccessLogResponse>> {
        return this.http.post<ApiResponse<StudentAccessLogResponse>>(`${this.API}/access/students`, request);
    }

    updateStudentAccess(idLog: number, request: any): Observable<ApiResponse<StudentAccessLogResponse>> {
        return this.http.put<ApiResponse<StudentAccessLogResponse>>(`${this.API}/access/students/${idLog}`, request);
    }

    justifyAbsence(idLog: number, reason: string): Observable<ApiResponse<void>> {
        const params = new HttpParams().set('reason', reason);
        return this.http.patch<ApiResponse<void>>(`${this.API}/access/students/${idLog}/justify`, null, { params });
    }

    // ── Staff Access Logs ─────────────────────────────────────────────────────

    getStaffAccessLogs(idCompany: number, date?: string): Observable<ApiResponse<StaffAccessLogResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<StaffAccessLogResponse[]>>(`${this.API}/access/staff`, { params });
    }

    registerStaffAccess(request: any): Observable<ApiResponse<StaffAccessLogResponse>> {
        return this.http.post<ApiResponse<StaffAccessLogResponse>>(`${this.API}/access/staff`, request);
    }

    // ── Infraction Types ──────────────────────────────────────────────────────

    getInfractionTypes(idCompany: number): Observable<ApiResponse<InfractionTypeResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<InfractionTypeResponse[]>>(`${this.API}/infractions/types`, { params });
    }

    createInfractionType(request: any): Observable<ApiResponse<InfractionTypeResponse>> {
        return this.http.post<ApiResponse<InfractionTypeResponse>>(`${this.API}/infractions/types`, request);
    }

    // ── Infractions ───────────────────────────────────────────────────────────
    // GET /api/v1/operations/infractions?idCompany=&idStudent=&severity=&page=&size=

    getInfractions(idCompany: number, filter?: InfractionFilter & { page?: number; size?: number }): Observable<ApiResponse<PageResponse<StudentInfractionResponse>>> {
        let params = new HttpParams()
            .set('idCompany', idCompany)
            .set('page', filter?.page ?? 0)
            .set('size', filter?.size ?? 50);
        if (filter?.idStudent) params = params.set('idStudent', filter.idStudent);
        if (filter?.severity) params = params.set('severity', filter.severity);
        return this.http.get<ApiResponse<PageResponse<StudentInfractionResponse>>>(`${this.API}/infractions`, { params });
    }

    createInfraction(request: any): Observable<ApiResponse<StudentInfractionResponse>> {
        return this.http.post<ApiResponse<StudentInfractionResponse>>(`${this.API}/infractions`, request);
    }

    notifyParent(idInfraction: number): Observable<ApiResponse<StudentInfractionResponse>> {
        return this.http.patch<ApiResponse<StudentInfractionResponse>>(`${this.API}/infractions/${idInfraction}/notify-parent`, null);
    }

    // ── Early Departures ──────────────────────────────────────────────────────

    getEarlyDepartures(idCompany: number, date?: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<EarlyDepartureResponse>>> {
        let params = new HttpParams().set('idCompany', idCompany).set('page', page).set('size', size);
        if (date) params = params.set('date', date);
        return this.http.get<ApiResponse<PageResponse<EarlyDepartureResponse>>>(`${this.API}/early-departures`, { params });
    }

    registerEarlyDeparture(request: any): Observable<ApiResponse<EarlyDepartureResponse>> {
        return this.http.post<ApiResponse<EarlyDepartureResponse>>(`${this.API}/early-departures`, request);
    }

    registerReturn(idEarlyDeparture: number, returnDate: string): Observable<ApiResponse<EarlyDepartureResponse>> {
        const params = new HttpParams().set('returnDate', returnDate);
        return this.http.patch<ApiResponse<EarlyDepartureResponse>>(`${this.API}/early-departures/${idEarlyDeparture}/return`, null, { params });
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    getStats(idCompany: number): Observable<ApiResponse<OperationsStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<OperationsStatsResponse>>(`${this.API}/stats`, { params });
    }
}
